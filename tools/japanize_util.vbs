'========================================================================
DEBUG_PRINT=0
DEBUG_PRINT_GUI=0
WorkDir=""
'========================================================================
Function DebugPrint(string)
	if DEBUG_PRINT=1 then
		logPrint2 string
	end if
End Function
'========================================================================
Function logPrint2(string)
	if UCase(Right(WScript.FullName, 11)) = "WSCRIPT.EXE" Then
	'GUI起動の場合
		if DEBUG_PRINT_GUI=1 then
			WScript.Echo string
		end If
	else
	'CUI起動の場合
		WScript.Echo string
	end If
End Function
'========================================================================
Class LogClass
     Private m_loglevel
     Public Property Let Loglevel(Value)
         m_loglevel = Value
     End Property
    Private Sub Class_Initialize()
         m_loglevel=2
     End Sub
     Public Sub e(string)
     	if m_loglevel >= 0 then
         	logPrint2 string
         end if
     End Sub
     Public Sub w(string)
     	if m_loglevel >= 1 then
        	logPrint2 string
        end if
     End Sub
     Public Sub i(string)
     	if m_loglevel >= 2 then
			logPrint2 string
         end if
     End Sub
     Public Sub d(string)
     	if m_loglevel >= 3 then
			logPrint2 string
        end if
     End Sub

End Class

Dim Log
Set Log = new LogClass
'========================================================================
function GetArgString(objWshNamed , name ,def_val )
	val	= def_val
	
	if objWshNamed.Exists(name) then
		val = objWshNamed.Item(name)
	end if
	GetArgString = val
End Function
'========================================================================
function getOnOff( str , default)

	if UCase(str) = "ON" then
		getOnOff = 1
	else 
		if UCase(str) = "OFF" then
			getOnOff = 0
		else
			getOnOff = default
		end if
	end if
End Function

'========================================================================
function GetArgOnOff(objWshNamed,name,def_val)
	def = getOnOff(def_val,0)
	GetArgOnOff = getOnOff(GetArgString(objWshNamed,name,def_val),def)
End Function

'========================================================================
Function escape_path(path)
	escape_path = """" & path & """"
End Function

'========================================================================
' JScriptで外部コマンドがうまく同期処理にならなかったのでVBSで
Function run_command(cmd)
	Dim objWShell

	Set objWShell = CreateObject("WScript.Shell")

	objWShell.CurrentDirectory = WorkDir
	Log.d "[CMD] " & cmd
	'objWShell.Run cmd, vbNormalFocus, False
	'objWShell.Run cmd, vbNormalFocus, True

	Set objExec = objWShell.Exec(cmd)
	Do While objExec.Status = 0
		Do Until objExec.StdOut.AtEndOfStream
			Log.d objExec.StdOut.ReadLine
		Loop
	    WScript.Sleep 500
	Loop
 
 	Do Until objExec.StdOut.AtEndOfStream
		Log.d objExec.StdOut.ReadLine
	Loop
 
	objWShell = none
End Function
'========================================================================
' JScriptでカレントディレクトリ変更できないようなので
Function SetCurrDir(dir)
	WorkDir = dir
End Function


