@echo off
setlocal
::cscript make_japanized_ROM.wsf %1 //nologo //Job:ggaps /dbg:ON /dbg_gui:ON
cscript make_japanized_ROM.wsf %1 //nologo //Job:ggaps
endlocal
pause

