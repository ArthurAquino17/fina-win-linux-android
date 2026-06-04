# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['Z:\\home\\arthur\\Documents\\fina-robusto\\server.py'],
    pathex=[],
    binaries=[],
    datas=[('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\index.html', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\styles.css', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\app.js', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\manifest.json', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\sw.js', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\icon.svg', 'public'), ('Z:\\home\\arthur\\Documents\\fina-robusto\\public\\favicon.ico', 'public')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Fina',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['Z:\\home\\arthur\\Documents\\fina-robusto\\public\\favicon.ico'],
)
