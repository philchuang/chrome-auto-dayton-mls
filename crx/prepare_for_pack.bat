@echo off
echo This will delete files that aren't necessary for the chrome extension!
echo Please ensure all files are committed to source control first!
echo Press Ctrl-C to cancel
pause
echo.
echo Deleting unnecessary files...
del ..\src\*.csproj
del ..\src\*.user
del ..\src\*.sublime-workspace
del ..\src\Web.config
del ..\src\Web.*.config
rd  ..\src\Properties /s /q
rd  ..\src\bin /s /q
rd  ..\src\obj /s /q
echo.
echo Files deleted, chrome extension is ready to pack.
echo After packing, remember to only check in the crx, and to restore the deleted files!
pause