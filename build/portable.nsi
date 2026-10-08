; Portable launcher for the Chinese build of DLSS 5 Swapper.
; Same shape as the build this replaces: unpack the payload into a private
; temporary folder, run the app from there, and let the OS clean up after it.
Unicode true
Name "DLSS 5 Swapper"
!ifndef OUTFILE
  !define OUTFILE "..\..\dist\DLSS5-Swapper-2.2.9-CN-portable.exe"
!endif
OutFile "${OUTFILE}"
Icon "..\_build_dlss5.ico"
RequestExecutionLevel user
SetCompressor zlib
SilentInstall silent
VIProductVersion "2.2.9.0"
VIAddVersionKey "ProductName" "DLSS 5 Swapper"
VIAddVersionKey "FileDescription" "DLSS 5 Swapper 2.2.9 portable (Simplified Chinese)"
VIAddVersionKey "FileVersion" "2.2.9"
VIAddVersionKey "LegalCopyright" "MIT License - Rakan Alkhaldi"

Section
  ; The payload is already compressed, so storing it keeps the build quick and
  ; the output the same size as the app it contains.
  SetCompress off
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=app-64.7z "..\..\dist\app-64.7z"
  nsis7z::Extract "$PLUGINSDIR\app-64.7z"
  Delete "$PLUGINSDIR\app-64.7z"
  System::Call 'Kernel32::SetEnvironmentVariableW(w "PORTABLE_EXECUTABLE_DIR", w "$EXEDIR")'
  System::Call 'Kernel32::SetEnvironmentVariableW(w "PORTABLE_EXECUTABLE_FILE", w "$EXEPATH")'
  ; A build with DEBUGPORT set hands the port to the app so the packaged result
  ; can be inspected over the DevTools protocol. The shipped build passes
  ; nothing at all.
  !ifdef DEBUGPORT
    ExecWait '"$PLUGINSDIR\DLSS 5 Swapper.exe" --remote-debugging-port=${DEBUGPORT}'
  !else
    ExecWait '"$PLUGINSDIR\DLSS 5 Swapper.exe"'
  !endif
SectionEnd
