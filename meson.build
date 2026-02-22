project('salopbar', 'c', version: '0.0.1', meson_version: '>= 1.9.0')

dependency('gtk4')
dependency('libadwaita-1')

dependency('astal-4-4.0')
dependency('astal-wireplumber-0.1')
dependency('astal-network-0.1')
dependency('astal-mpris-0.1')
dependency('astal-hyprland-0.1')
dependency('astal-notifd-0.1')
dependency('astal-apps-0.1')

name = meson.project_name()
prefix = get_option('prefix')
pkgdatadir = prefix / get_option('datadir') / name
bindir = prefix / get_option('bindir')
layer_shell = dependency('gtk4-layer-shell-0')
domain = 'dev.heleno.salopbar'

gnome = import('gnome')
i18n = import('i18n')
gjs = find_program('gjs', required: true)
GETTEXT_PACKAGE = domain

subdir('data')
subdir('src')

test(
  'validate-gschema',
  find_program('glib-compile-schemas'),
  args: [
    '--strict',
    '--dry-run', meson.current_source_dir(),
  ],
)

gnome.post_install(
  # gtk_update_icon_cache: true,
  glib_compile_schemas: true,
  # update_desktop_database: true,
)
