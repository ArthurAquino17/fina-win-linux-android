from __future__ import annotations

import csv
import os
import sqlite3
import sys
from pathlib import Path
from dataclasses import dataclass
from datetime import date, datetime
from typing import TYPE_CHECKING

try:
    import tkinter as tk
    from tkinter import filedialog, messagebox, ttk
except ModuleNotFoundError as exc:
    if exc.name != "tkinter":
        raise
    tk = None  # type: ignore[assignment]
    filedialog = None  # type: ignore[assignment]
    messagebox = None  # type: ignore[assignment]
    ttk = None  # type: ignore[assignment]

if TYPE_CHECKING:
    import tkinter as tk_type
    from tkinter import ttk as ttk_type


APP_TITLE = "Fina - Controle Financeiro"
APP_NAME = "Fina"


def get_data_dir() -> Path:
    if sys.platform.startswith("win"):
        base = os.environ.get("APPDATA")
        if base:
            return Path(base) / APP_NAME
        return Path.home() / APP_NAME

    base = os.environ.get("XDG_DATA_HOME")
    if base:
        return Path(base) / APP_NAME
    return Path.home() / ".local" / "share" / APP_NAME


DATA_DIR = get_data_dir()
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = str(DATA_DIR / "fina.db")

TRANSACTION_TYPES = ("Despesa", "Receita")
DEFAULT_CATEGORIES = (
    "Salario",
    "Cartao",
    "Contas",
    "Alimentacao",
    "Moradia",
    "Transporte",
    "Saude",
    "Lazer",
    "Educacao",
    "Investimento",
    "Assinaturas",
    "Impostos",
    "Outros",
)


def money_to_float(value: str) -> float:
    cleaned = value.strip().replace(".", "").replace(",", ".")
    return float(cleaned)


def float_to_money(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def parse_date(value: str) -> str:
    return datetime.strptime(value.strip(), "%Y-%m-%d").date().isoformat()


def today_iso() -> str:
    return date.today().isoformat()


@dataclass
class Transaction:
    id: int | None
    tx_date: str
    description: str
    category: str
    amount: float
    tx_type: str
    note: str


class FinanceDB:
    def __init__(self, path: str) -> None:
        self.path = path
        self.connection = sqlite3.connect(self.path)
        self.connection.row_factory = sqlite3.Row
        self._create_schema()

    def _create_schema(self) -> None:
        self.connection.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_date TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                amount REAL NOT NULL,
                tx_type TEXT NOT NULL CHECK (tx_type IN ('Despesa', 'Receita')),
                note TEXT DEFAULT ''
            )
            """
        )
        self.connection.commit()

    def seed_categories(self) -> None:
        # Mantem a lista padrao apenas como sugestao para a interface.
        pass

    def add_transaction(self, tx: Transaction) -> None:
        self.connection.execute(
            """
            INSERT INTO transactions (tx_date, description, category, amount, tx_type, note)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (tx.tx_date, tx.description, tx.category, tx.amount, tx.tx_type, tx.note),
        )
        self.connection.commit()

    def update_transaction(self, tx: Transaction) -> None:
        if tx.id is None:
            raise ValueError("Transaction id is required for update")
        self.connection.execute(
            """
            UPDATE transactions
               SET tx_date = ?, description = ?, category = ?, amount = ?, tx_type = ?, note = ?
             WHERE id = ?
            """,
            (tx.tx_date, tx.description, tx.category, tx.amount, tx.tx_type, tx.note, tx.id),
        )
        self.connection.commit()

    def delete_transaction(self, transaction_id: int) -> None:
        self.connection.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
        self.connection.commit()

    def fetch_transactions(
        self,
        search: str = "",
        tx_type: str = "Todos",
        month_filter: str = "",
    ) -> list[sqlite3.Row]:
        query = "SELECT * FROM transactions WHERE 1 = 1"
        params: list[object] = []

        if search.strip():
            query += " AND (description LIKE ? OR category LIKE ? OR note LIKE ?)"
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern, pattern])

        if tx_type in TRANSACTION_TYPES:
            query += " AND tx_type = ?"
            params.append(tx_type)

        if month_filter.strip():
            query += " AND substr(tx_date, 1, 7) = ?"
            params.append(month_filter.strip())

        query += " ORDER BY tx_date DESC, id DESC"
        cursor = self.connection.execute(query, params)
        return cursor.fetchall()

    def summary(self, month_filter: str = "") -> dict[str, float]:
        query = "SELECT tx_type, COALESCE(SUM(amount), 0) AS total FROM transactions WHERE 1 = 1"
        params: list[object] = []
        if month_filter.strip():
            query += " AND substr(tx_date, 1, 7) = ?"
            params.append(month_filter.strip())
        query += " GROUP BY tx_type"

        rows = self.connection.execute(query, params).fetchall()
        totals = {"Despesa": 0.0, "Receita": 0.0}
        for row in rows:
            totals[row["tx_type"]] = float(row["total"] or 0)
        totals["Saldo"] = totals["Receita"] - totals["Despesa"]
        return totals

    def category_totals(self, month_filter: str = "") -> list[sqlite3.Row]:
        query = """
            SELECT category, COALESCE(SUM(amount), 0) AS total
              FROM transactions
             WHERE tx_type = 'Despesa'
        """
        params: list[object] = []
        if month_filter.strip():
            query += " AND substr(tx_date, 1, 7) = ?"
            params.append(month_filter.strip())
        query += " GROUP BY category ORDER BY total DESC, category COLLATE NOCASE"
        return self.connection.execute(query, params).fetchall()

    def categories_in_use(self) -> list[str]:
        rows = self.connection.execute(
            "SELECT DISTINCT category FROM transactions ORDER BY category COLLATE NOCASE"
        ).fetchall()
        used = [row["category"] for row in rows if row["category"]]
        merged = list(dict.fromkeys([*DEFAULT_CATEGORIES, *used]))
        return merged

    def all_transactions_for_export(self) -> list[sqlite3.Row]:
        return self.connection.execute(
            "SELECT * FROM transactions ORDER BY tx_date DESC, id DESC"
        ).fetchall()

    def close(self) -> None:
        self.connection.close()


class FinanceApp(tk.Tk if tk is not None else object):
    def __init__(self) -> None:
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("1180x760")
        self.minsize(1060, 700)

        

        self.db = FinanceDB(DB_FILE)
        self.selected_id: int | None = None

        self.search_var = tk.StringVar()
        self.filter_type_var = tk.StringVar(value="Todos")
        self.filter_month_var = tk.StringVar(value="")

        self.date_var = tk.StringVar(value=today_iso())
        self.description_var = tk.StringVar()
        self.category_var = tk.StringVar(value=DEFAULT_CATEGORIES[0])
        self.amount_var = tk.StringVar()
        self.type_var = tk.StringVar(value="Despesa")
        self.note_var = tk.StringVar()

        self._build_style()
        self._build_ui()
        self._refresh_categories()
        self.refresh_view()
        self.protocol("WM_DELETE_WINDOW", self.on_close)

    def _build_style(self) -> None:
        style = ttk.Style(self)
        available = style.theme_names()
        if "clam" in available:
            style.theme_use("clam")

        style.configure("TFrame", background="#f4f6f8")
        style.configure("Card.TFrame", background="#ffffff", relief="flat")
        style.configure("TLabel", background="#f4f6f8", font=("Segoe UI", 10))
        style.configure("Title.TLabel", font=("Segoe UI", 18, "bold"))
        style.configure("Section.TLabel", font=("Segoe UI", 11, "bold"))
        style.configure("CardValue.TLabel", font=("Segoe UI", 16, "bold"))
        style.configure("TButton", padding=(10, 6))
        style.configure("Treeview", rowheight=28, font=("Segoe UI", 10))
        style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"))
        style.map("Treeview", background=[("selected", "#dbeafe")], foreground=[("selected", "#111827")])

    def _build_ui(self) -> None:
        root = ttk.Frame(self, padding=16)
        root.pack(fill="both", expand=True)

        header = ttk.Frame(root)
        header.pack(fill="x")
        ttk.Label(header, text="Controle Financeiro", style="Title.TLabel").pack(side="left")
        ttk.Label(
            header,
            text="Lancamentos, saldo e filtros em um app local para Windows e Linux",
            foreground="#4b5563",
        ).pack(side="left", padx=12, pady=6)

        self.summary_frame = ttk.Frame(root)
        self.summary_frame.pack(fill="x", pady=(14, 14))

        self.card_income = self._make_card(self.summary_frame, "Receitas")
        self.card_expense = self._make_card(self.summary_frame, "Despesas")
        self.card_balance = self._make_card(self.summary_frame, "Saldo")
        self.card_count = self._make_card(self.summary_frame, "Lancamentos")
        self.card_despesa_ratio = self._make_card(self.summary_frame, "% da renda gasta")

        self.card_income.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.card_expense.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.card_balance.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.card_count.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.card_despesa_ratio.pack(side="left", fill="x", expand=True)

        content = ttk.Frame(root)
        content.pack(fill="both", expand=True)

        left = ttk.Frame(content)
        left.pack(side="left", fill="y", padx=(0, 14))
        left.configure(width=360)

        right = ttk.Frame(content)
        right.pack(side="left", fill="both", expand=True)

        self._build_category_dashboard(right)
        self._build_form(left)
        self._build_filters(left)
        self._build_metrics(left)
        self._build_table(right)

    def _make_card(self, parent: "ttk_type.Frame", title: str) -> "ttk_type.Frame":
        frame = ttk.Frame(parent, style="Card.TFrame", padding=14)
        ttk.Label(frame, text=title, style="Section.TLabel", background="#ffffff").pack(anchor="w")
        label = ttk.Label(frame, text="R$ 0,00", style="CardValue.TLabel", background="#ffffff")
        label.pack(anchor="w", pady=(8, 0))
        frame.value_label = label  # type: ignore[attr-defined]
        return frame

    def _build_form(self, parent: "ttk_type.Frame") -> None:
        box = ttk.LabelFrame(parent, text="Novo lancamento", padding=12)
        box.pack(fill="x", pady=(0, 14))

        fields = [
            ("Data (AAAA-MM-DD)", self.date_var),
            ("Descricao", self.description_var),
            ("Categoria", self.category_var),
            ("Valor", self.amount_var),
            ("Tipo", self.type_var),
            ("Observacao", self.note_var),
        ]

        for index, (label_text, var) in enumerate(fields):
            ttk.Label(box, text=label_text).grid(row=index * 2, column=0, sticky="w", pady=(4, 2))
            if label_text == "Tipo":
                self.type_combo = ttk.Combobox(
                    box,
                    textvariable=var,
                    values=TRANSACTION_TYPES,
                    state="readonly",
                )
                self.type_combo.grid(row=index * 2 + 1, column=0, sticky="ew")
            elif label_text == "Categoria":
                self.category_combo = ttk.Combobox(box, textvariable=var, values=DEFAULT_CATEGORIES, state="readonly")
                self.category_combo.grid(row=index * 2 + 1, column=0, sticky="ew")
            else:
                entry = ttk.Entry(box, textvariable=var)
                entry.grid(row=index * 2 + 1, column=0, sticky="ew")

        button_row = ttk.Frame(box)
        button_row.grid(row=12, column=0, sticky="ew", pady=(10, 0))
        button_row.columnconfigure((0, 1), weight=1)

        ttk.Button(button_row, text="Salvar", command=self.save_transaction).grid(row=0, column=0, sticky="ew", padx=(0, 6))
        ttk.Button(button_row, text="Limpar", command=self.clear_form).grid(row=0, column=1, sticky="ew", padx=(6, 0))
        ttk.Button(button_row, text="Atualizar", command=self.load_selected_into_form).grid(
            row=1, column=0, sticky="ew", padx=(0, 6), pady=(8, 0)
        )
        ttk.Button(button_row, text="Excluir", command=self.delete_selected).grid(
            row=1, column=1, sticky="ew", padx=(6, 0), pady=(8, 0)
        )

        box.columnconfigure(0, weight=1)

    def _build_filters(self, parent: "ttk_type.Frame") -> None:
        box = ttk.LabelFrame(parent, text="Filtros e exportacao", padding=12)
        box.pack(fill="x")

        ttk.Label(box, text="Busca").grid(row=0, column=0, sticky="w")
        ttk.Entry(box, textvariable=self.search_var).grid(row=1, column=0, columnspan=2, sticky="ew", pady=(2, 8))

        ttk.Label(box, text="Tipo").grid(row=2, column=0, sticky="w")
        ttk.Combobox(
            box,
            textvariable=self.filter_type_var,
            values=("Todos", *TRANSACTION_TYPES),
            state="readonly",
        ).grid(row=3, column=0, sticky="ew", pady=(2, 8))

        ttk.Label(box, text="Mes (AAAA-MM)").grid(row=2, column=1, sticky="w", padx=(8, 0))
        ttk.Entry(box, textvariable=self.filter_month_var).grid(row=3, column=1, sticky="ew", padx=(8, 0), pady=(2, 8))

        actions = ttk.Frame(box)
        actions.grid(row=4, column=0, columnspan=2, sticky="ew", pady=(6, 0))
        actions.columnconfigure((0, 1), weight=1)

        ttk.Button(actions, text="Aplicar", command=self.refresh_view).grid(row=0, column=0, sticky="ew", padx=(0, 6))
        ttk.Button(actions, text="Exportar CSV", command=self.export_csv).grid(row=0, column=1, sticky="ew", padx=(6, 0))

        box.columnconfigure(0, weight=1)
        box.columnconfigure(1, weight=1)

    def _build_metrics(self, parent: "ttk_type.Frame") -> None:
        box = ttk.LabelFrame(parent, text="Metricas da renda", padding=12)
        box.pack(fill="x", pady=(14, 0))

        self.metric_status_var = tk.StringVar(value="Sem dados suficientes ainda.")
        self.metric_income_ratio_var = tk.StringVar(value="Despesa sobre renda: 0%")
        self.metric_savings_var = tk.StringVar(value="Taxa de poupanca: 0%")
        self.metric_top_category_var = tk.StringVar(value="Maior categoria: -")
        self.metric_guidance_var = tk.StringVar(value="Cadastre receitas e despesas para ver recomendações.")

        ttk.Label(box, textvariable=self.metric_status_var, style="Section.TLabel", wraplength=320, justify="left").pack(
            anchor="w"
        )
        ttk.Separator(box).pack(fill="x", pady=8)
        ttk.Label(box, textvariable=self.metric_income_ratio_var, wraplength=320, justify="left").pack(anchor="w", pady=(0, 4))
        ttk.Label(box, textvariable=self.metric_savings_var, wraplength=320, justify="left").pack(anchor="w", pady=(0, 4))
        ttk.Label(box, textvariable=self.metric_top_category_var, wraplength=320, justify="left").pack(anchor="w", pady=(0, 4))
        ttk.Label(box, textvariable=self.metric_guidance_var, wraplength=320, justify="left").pack(anchor="w", pady=(8, 0))

    def _build_category_dashboard(self, parent: "ttk_type.Frame") -> None:
        box = ttk.LabelFrame(parent, text="Dashboard por categoria", padding=12)
        box.pack(fill="x", pady=(0, 14))

        self.category_chart_title_var = tk.StringVar(value="Top categorias do mes")
        self.category_chart_hint_var = tk.StringVar(
            value="Aqui voce ve as categorias que mais pesam no seu orçamento."
        )

        ttk.Label(box, textvariable=self.category_chart_title_var, style="Section.TLabel").pack(anchor="w")
        ttk.Label(box, textvariable=self.category_chart_hint_var, wraplength=700, justify="left").pack(anchor="w", pady=(2, 8))

        chart_container = ttk.Frame(box)
        chart_container.pack(fill="x", pady=(0, 10))

        self.category_chart_canvas = tk.Canvas(
            chart_container,
            height=220,
            highlightthickness=0,
            background="#f8fafc",
        )
        self.category_chart_canvas.pack(fill="x", expand=True)

        header = ttk.Frame(box)
        header.pack(fill="x", pady=(0, 8))
        ttk.Label(header, text="Categoria", width=22).pack(side="left")
        ttk.Label(header, text="Valor", width=12, anchor="e").pack(side="left")
        ttk.Label(header, text="% das despesas", width=14, anchor="e").pack(side="left", padx=(8, 0))

        canvas = tk.Canvas(box, height=180, highlightthickness=0, background="#f4f6f8")
        scrollbar = ttk.Scrollbar(box, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        inner = ttk.Frame(canvas)
        self.category_dashboard_window = canvas.create_window((0, 0), window=inner, anchor="nw")
        self.category_dashboard_canvas = canvas
        self.category_dashboard_inner = inner
        self.category_dashboard_rows: list[dict[str, object]] = []

        def on_configure(event: "tk_type.Event") -> None:
            canvas.configure(scrollregion=canvas.bbox("all"))

        def on_canvas_configure(event: "tk_type.Event") -> None:
            canvas.itemconfigure(self.category_dashboard_window, width=event.width)

        inner.bind("<Configure>", on_configure)
        canvas.bind("<Configure>", on_canvas_configure)

        self.category_dashboard_empty_var = tk.StringVar(value="Cadastre despesas para ver a distribuição por categoria.")
        self.category_dashboard_empty_label = ttk.Label(inner, textvariable=self.category_dashboard_empty_var, justify="left")
        self.category_dashboard_empty_label.pack(anchor="w", pady=(2, 0))

    def _build_table(self, parent: "ttk_type.Frame") -> None:
        top = ttk.Frame(parent)
        top.pack(fill="x", pady=(0, 8))
        ttk.Label(top, text="Lancamentos", style="Section.TLabel").pack(side="left")
        ttk.Button(top, text="Recarregar", command=self.refresh_view).pack(side="right")

        columns = ("id", "date", "description", "category", "type", "amount", "note")
        self.tree = ttk.Treeview(parent, columns=columns, show="headings", selectmode="browse")
        self.tree.pack(fill="both", expand=True, side="left")

        self.tree.heading("id", text="ID")
        self.tree.heading("date", text="Data")
        self.tree.heading("description", text="Descricao")
        self.tree.heading("category", text="Categoria")
        self.tree.heading("type", text="Tipo")
        self.tree.heading("amount", text="Valor")
        self.tree.heading("note", text="Observacao")

        self.tree.column("id", width=60, anchor="center")
        self.tree.column("date", width=100, anchor="center")
        self.tree.column("description", width=220)
        self.tree.column("category", width=140)
        self.tree.column("type", width=90, anchor="center")
        self.tree.column("amount", width=110, anchor="e")
        self.tree.column("note", width=240)

        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side="left", fill="y")
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        self.tree.bind("<Double-1>", self.load_selected_into_form)

    def _refresh_categories(self) -> None:
        categories = self.db.categories_in_use()
        if hasattr(self, "category_combo"):
            self.category_combo.configure(values=categories)
        self.category_var.set(self.category_var.get() if self.category_var.get() in categories else categories[0])

    def get_form_transaction(self) -> Transaction:
        tx_date = parse_date(self.date_var.get())
        description = self.description_var.get().strip()
        category = self.category_var.get().strip()
        amount = money_to_float(self.amount_var.get())
        tx_type = self.type_var.get().strip()
        note = self.note_var.get().strip()

        if not description:
            raise ValueError("Informe uma descricao.")
        if not category:
            raise ValueError("Informe uma categoria.")
        if tx_type not in TRANSACTION_TYPES:
            raise ValueError("Escolha um tipo valido.")
        if amount <= 0:
            raise ValueError("O valor precisa ser maior que zero.")

        return Transaction(
            id=self.selected_id,
            tx_date=tx_date,
            description=description,
            category=category,
            amount=amount,
            tx_type=tx_type,
            note=note,
        )

    def save_transaction(self) -> None:
        try:
            tx = self.get_form_transaction()
            if tx.id is None:
                self.db.add_transaction(tx)
                messagebox.showinfo("Salvo", "Lancamento adicionado com sucesso.")
            else:
                self.db.update_transaction(tx)
                messagebox.showinfo("Atualizado", "Lancamento atualizado com sucesso.")
            self.clear_form()
            self.refresh_view()
        except Exception as exc:
            messagebox.showerror("Erro", str(exc))

    def clear_form(self) -> None:
        self.selected_id = None
        self.date_var.set(today_iso())
        self.description_var.set("")
        self.category_var.set(DEFAULT_CATEGORIES[0])
        self.amount_var.set("")
        self.type_var.set("Despesa")
        self.note_var.set("")
        self.tree.selection_remove(self.tree.selection())

    def refresh_view(self) -> None:
        search = self.search_var.get()
        tx_type = self.filter_type_var.get()
        month_filter = self.filter_month_var.get()
        rows = self.db.fetch_transactions(search=search, tx_type=tx_type, month_filter=month_filter)

        for item in self.tree.get_children():
            self.tree.delete(item)

        for row in rows:
            self.tree.insert(
                "",
                "end",
                values=(
                    row["id"],
                    row["tx_date"],
                    row["description"],
                    row["category"],
                    row["tx_type"],
                    float_to_money(float(row["amount"])),
                    row["note"],
                ),
            )

        totals = self.db.summary(month_filter=month_filter)
        category_totals = self.db.category_totals(month_filter=month_filter)
        self.card_income.value_label.configure(text=float_to_money(totals["Receita"]))
        self.card_expense.value_label.configure(text=float_to_money(totals["Despesa"]))
        self.card_balance.value_label.configure(text=float_to_money(totals["Saldo"]))
        self.card_count.value_label.configure(text=str(len(rows)))
        self._update_metrics(totals, category_totals, len(rows))
        self._update_category_dashboard(category_totals, totals["Despesa"])
        self._update_category_chart(category_totals, totals["Receita"], totals["Despesa"])
        self._refresh_categories()

    def _update_metrics(self, totals: dict[str, float], category_totals: list[sqlite3.Row], count: int) -> None:
        income = totals["Receita"]
        expense = totals["Despesa"]
        balance = totals["Saldo"]

        expense_ratio = (expense / income) if income > 0 else 0.0
        savings_ratio = (balance / income) if income > 0 else 0.0

        if income <= 0:
            status = "Cadastre uma receita para calcular os indicadores."
            guidance = "Sem renda registrada, nao e possivel medir se as despesas estao saudaveis."
        elif expense_ratio <= 0.5:
            status = "Despesa leve em relacao a renda."
            guidance = "Ainda ha espaco para investir, guardar ou acelerar objetivos financeiros."
        elif expense_ratio <= 0.7:
            status = "Despesa dentro de uma faixa razoavel."
            guidance = "Vale acompanhar categorias grandes para evitar que o orçamento aperte."
        elif expense_ratio <= 0.85:
            status = "Despesa alta. O orçamento merece ajustes."
            guidance = "Tente reduzir categorias variaveis e criar um teto mensal para gastos não essenciais."
        else:
            status = "Despesa muito alta para a renda atual."
            guidance = "A prioridade agora e cortar vazamentos e proteger as despesas fixas essenciais."

        top_category_text = "Maior categoria: -"
        if category_totals:
            top = category_totals[0]
            top_amount = float(top["total"] or 0)
            category_share = (top_amount / expense) if expense > 0 else 0.0
            top_category_text = f"Maior categoria: {top['category']} ({float_to_money(top_amount)} | {category_share:.0%} das despesas)"
            if category_share >= 0.4 and expense > 0:
                guidance += " A maior parte dos gastos esta concentrada em uma so categoria."
            elif category_share >= 0.25 and expense > 0:
                guidance += " A maior categoria ja pesa bastante; uma pequena reducao aqui pode fazer diferença."

        monthly_budget = income * 0.7 if income > 0 else 0.0
        suggested_limit = float_to_money(monthly_budget)
        self.card_despesa_ratio.value_label.configure(text=f"{expense_ratio:.0%}")
        self.metric_status_var.set(f"{status}  |  {count} lancamentos no filtro atual.")
        self.metric_income_ratio_var.set(
            f"Despesa sobre renda: {expense_ratio:.0%}  |  Meta sugerida para despesas: até {suggested_limit}"
        )
        self.metric_savings_var.set(f"Taxa de poupanca: {savings_ratio:.0%}  |  Saldo: {float_to_money(balance)}")
        self.metric_top_category_var.set(top_category_text)
        self.metric_guidance_var.set(guidance)

    def _update_category_dashboard(self, category_totals: list[sqlite3.Row], total_expenses: float) -> None:
        for child in self.category_dashboard_inner.winfo_children():
            child.destroy()
        self.category_dashboard_rows.clear()

        if not category_totals or total_expenses <= 0:
            ttk.Label(
                self.category_dashboard_inner,
                text="Cadastre despesas para ver a distribuição por categoria.",
                justify="left",
            ).pack(anchor="w", pady=(2, 0))
            return

        for row in category_totals[:10]:
            category = str(row["category"])
            amount = float(row["total"] or 0)
            share = amount / total_expenses if total_expenses > 0 else 0.0
            tip = self._category_tip(category, amount, share, total_expenses)

            row_frame = ttk.Frame(self.category_dashboard_inner)
            row_frame.pack(fill="x", pady=(0, 8))
            row_frame.columnconfigure(1, weight=1)

            ttk.Label(row_frame, text=category, width=22).grid(row=0, column=0, sticky="w")
            ttk.Label(row_frame, text=float_to_money(amount), width=12, anchor="e").grid(row=0, column=1, sticky="e", padx=(6, 8))
            ttk.Label(row_frame, text=f"{share:.0%}", width=8, anchor="e").grid(row=0, column=2, sticky="e")

            bar = ttk.Progressbar(row_frame, value=share * 100, maximum=100)
            bar.grid(row=1, column=0, columnspan=3, sticky="ew", pady=(4, 0))

            ttk.Label(
                row_frame,
                text=tip,
                wraplength=560,
                justify="left",
                foreground="#475569",
            ).grid(row=2, column=0, columnspan=3, sticky="w", pady=(2, 0))

            self.category_dashboard_rows.append(
                {
                    "frame": row_frame,
                    "bar": bar,
                    "category": category,
                    "amount": amount,
                    "share": share,
                }
            )

    def _category_tip(self, category: str, amount: float, share: float, total_expenses: float) -> str:
        name = category.strip().lower()

        if total_expenses <= 0:
            return "Cadastre despesas para ver dicas específicas desta categoria."

        if name in {"cartao", "cartão"}:
            if share >= 0.25:
                return "Cartão está pesado: vale conferir parcelas, assinaturas e compras por impulso."
            return "Use um teto mensal para o cartão e revise compras parceladas antes de fechar a fatura."

        if name in {"contas", "moradia"}:
            if share >= 0.35:
                return "Despesas fixas estão altas; renegocie contratos, energia, internet e serviços recorrentes."
            return "Tente prever essas contas no início do mês para evitar apertos no caixa."

        if name == "alimentacao":
            if share >= 0.20:
                return "Alimentação está alta; planeje compras, marmitas e limites para delivery."
            return "Comprar com lista e cozinhar em casa ajuda a manter essa categoria sob controle."

        if name == "transporte":
            if share >= 0.15:
                return "Transporte pesa bastante; vale comparar rotas, caronas, combustível e manutenção."
            return "Planejar deslocamentos e agrupar saídas reduz custo por viagem."

        if name == "saude":
            if share >= 0.15:
                return "Saúde está relevante no mês; separe uma reserva para consultas, remédios e exames."
            return "Use uma reserva pequena para evitar que gastos médicos quebrem o orçamento."

        if name == "lazer":
            if share >= 0.15:
                return "Lazer está consumindo boa parte da renda; defina um teto antes de gastar."
            return "Mantenha o lazer, mas com limite claro para não virar vazamento financeiro."

        if name == "assinaturas":
            if share >= 0.10:
                return "Assinaturas acumuladas já começam a pesar; corte as pouco usadas."
            return "Revise assinaturas a cada mês e cancele o que não entrega valor real."

        if name == "impostos":
            return "Impostos pedem reserva antecipada; separar esse valor evita surpresa."

        if name == "educacao":
            if share >= 0.15:
                return "Educação precisa trazer retorno claro; priorize cursos e materiais com resultado prático."
            return "Bom investimento, mas mantenha foco no que acelera renda ou carreira."

        if name == "investimento":
            return "Investimento é ótimo, mas sem comprometer reserva de emergência e contas essenciais."

        if name == "salario":
            return "Salário não entra nas despesas, então ele serve como base para medir o quanto pode ser gasto."

        if share >= 0.25:
            return "Categoria muito pesada: tente definir um teto mensal e acompanhar toda semana."
        if share >= 0.12:
            return "Categoria com peso moderado: pequenos ajustes aqui já melhoram o orçamento."
        return "Categoria sob controle: vale só manter o acompanhamento e evitar pequenos excessos."

    def _update_category_chart(
        self,
        category_totals: list[sqlite3.Row],
        total_income: float,
        total_expenses: float,
    ) -> None:
        canvas = self.category_chart_canvas
        canvas.delete("all")
        width = max(canvas.winfo_width(), 700)
        height = max(canvas.winfo_height(), 220)

        canvas.create_rectangle(0, 0, width, height, fill="#f8fafc", outline="")

        if not category_totals or total_expenses <= 0:
            canvas.create_text(
                width / 2,
                height / 2,
                text="Cadastre despesas para visualizar o gráfico por categoria.",
                fill="#64748b",
                font=("Segoe UI", 10),
            )
            return

        items = category_totals[:6]
        chart_left = 60
        chart_right = width - 24
        chart_top = 24
        chart_bottom = height - 36
        plot_height = chart_bottom - chart_top
        canvas.create_line(chart_left, chart_top, chart_left, chart_bottom, fill="#94a3b8", width=2)
        canvas.create_line(chart_left, chart_bottom, chart_right, chart_bottom, fill="#94a3b8", width=2)

        for tick in range(0, 101, 20):
            y = chart_bottom - (plot_height * tick / 100)
            canvas.create_line(chart_left - 5, y, chart_right, y, fill="#e2e8f0")
            canvas.create_text(chart_left - 10, y, text=f"{tick}%", anchor="e", fill="#64748b", font=("Segoe UI", 8))

        slot_width = (chart_right - chart_left - 20) / len(items)
        bar_width = min(72, slot_width * 0.62)
        palette = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#0891b2", "#16a34a"]

        for index, row in enumerate(items):
            category = str(row["category"])
            amount = float(row["total"] or 0)
            share_expense = amount / total_expenses if total_expenses > 0 else 0.0
            share_income = amount / total_income if total_income > 0 else 0.0
            chart_value = min(share_income, 1.0)
            bar_height = max(8, plot_height * chart_value)
            x_center = chart_left + 20 + slot_width * index + slot_width / 2
            x1 = x_center - bar_width / 2
            x2 = x_center + bar_width / 2
            y2 = chart_bottom
            y1 = y2 - bar_height
            color = "#2563eb"
            if share_income >= 0.3:
                color = "#dc2626"
            elif share_income >= 0.15:
                color = "#ea580c"
            elif share_income >= 0.08:
                color = "#d97706"
            else:
                color = palette[index % len(palette)]

            canvas.create_rectangle(x1, y1, x2, y2, fill=color, outline="")
            canvas.create_text(x_center, y1 - 14, text=float_to_money(amount), fill="#0f172a", font=("Segoe UI", 9, "bold"))
            canvas.create_text(
                x_center,
                chart_bottom + 14,
                text=category,
                fill="#0f172a",
                font=("Segoe UI", 8),
                width=slot_width - 8,
            )
            canvas.create_text(
                x_center,
                y2 + 28,
                text=f"{share_expense:.0%} das despesas | {share_income:.0%} da renda",
                fill="#475569",
                font=("Segoe UI", 8),
                width=slot_width - 8,
            )

    def on_tree_select(self, event: "tk_type.Event | None" = None) -> None:
        selection = self.tree.selection()
        if not selection:
            return
        values = self.tree.item(selection[0], "values")
        self.selected_id = int(values[0])

    def load_selected_into_form(self, event: "tk_type.Event | None" = None) -> None:
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Selecao", "Selecione um lancamento na tabela.")
            return
        values = self.tree.item(selection[0], "values")
        self.selected_id = int(values[0])
        self.date_var.set(values[1])
        self.description_var.set(values[2])
        self.category_var.set(values[3])
        self.type_var.set(values[4])
        self.amount_var.set(values[5].replace("R$ ", "").replace(".", "").replace(",", "."))
        self.note_var.set(values[6])

    def delete_selected(self) -> None:
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Selecao", "Selecione um lancamento para excluir.")
            return
        values = self.tree.item(selection[0], "values")
        transaction_id = int(values[0])
        description = values[2]
        confirm = messagebox.askyesno(
            "Confirmar exclusao",
            f"Excluir o lancamento '{description}'?",
        )
        if not confirm:
            return
        self.db.delete_transaction(transaction_id)
        self.clear_form()
        self.refresh_view()

    def export_csv(self) -> None:
        rows = self.db.all_transactions_for_export()
        if not rows:
            messagebox.showinfo("Exportacao", "Nao ha lancamentos para exportar.")
            return

        default_name = f"financeiro_{date.today().isoformat()}.csv"
        path = filedialog.asksaveasfilename(
            title="Salvar CSV",
            defaultextension=".csv",
            initialfile=default_name,
            filetypes=[("CSV", "*.csv")],
        )
        if not path:
            return

        with open(path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerow(["id", "data", "descricao", "categoria", "tipo", "valor", "observacao"])
            for row in rows:
                writer.writerow(
                    [
                        row["id"],
                        row["tx_date"],
                        row["description"],
                        row["category"],
                        row["tx_type"],
                        f"{float(row['amount']):.2f}",
                        row["note"],
                    ]
                )

        messagebox.showinfo("Exportacao", f"CSV salvo em:\n{path}")

    def on_close(self) -> None:
        self.db.close()
        self.destroy()


def main() -> int:
    if tk is None:
        print("Nao foi possivel iniciar a interface grafica porque o modulo 'tkinter' nao esta instalado.")
        print("No Ubuntu/Debian, rode: sudo apt install python3-tk")
        print("No Fedora, rode: sudo dnf install python3-tkinter")
        print("No Arch, rode: sudo pacman -S tk")
        return 1

    try:
        app = FinanceApp()
        app.mainloop()
        return 0
    except tk.TclError as exc:
        print("Nao foi possivel iniciar a interface grafica.")
        print(exc)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
