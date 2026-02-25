{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.tesseract
    pkgs.poppler_utils
    pkgs.libGL
    pkgs.glib
  ];
}
