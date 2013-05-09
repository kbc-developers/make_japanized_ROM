//==================================================================
// Internal use only (do not edit here)
var objFso		= WScript.CreateObject("Scripting.FileSystemObject") ;

var objWshNamed	 	= WScript.Arguments.Named;
var	objWshUnnamed	= WScript.Arguments.Unnamed;

//==================================================================
//	FileSystemObject
//  オープンモード
var FORREADING      = 1;    // 読み取り専用
var FORWRITING      = 2;    // 書き込み専用
var FORAPPENDING    = 8;    // 追加書き込み

//  開くファイルの形式
var TRISTATE_TRUE       = -1;   // Unicode
var TRISTATE_FALSE      =  0;   // ASCII
var TRISTATE_USEDEFAULT = -2;   // システムデフォルト
//==================================================================
// ADODB.Stream
		// STREAMTYPEENUM
		// HTTP://MSDN.MICROSOFT.COM/JA-JP/LIBRARY/CC389884.ASPX
var ADTYPEBINARY = 1; // バイナリ
var ADTYPETEXT   = 2; // テキスト

// 読み込み方法
var ADREADALL  = -1; // 全行
var ADREADLINE = -2; // 一行ごと

// 書き込み方法
var ADWRITECHAR = 0; // 改行なし
var ADWRITELINE = 1; // 改行あり

// ファイルの保存方法
var ADSAVECREATENOTEXIST  = 1; // ない場合は新規作成
var ADSAVECREATEOVERWRITE = 2; // ある場合は上書き

/*==================================================================
Memo:
<any_place>/  = SCRIPT_DIR
  + diff/
  |  +XXXX/   ( this depend on device name)
  |    + files/
  |    |  + system/
  |    |  |  + xxxx
  |    |  + boot.img
  |    +config_xxxx.js
  + tools/
  |  +7z.exe
  |  +japanize_config_xxxx.js
  |  +japanize_main.js
  |  +japanize_util.vbs
  |  + etc...
  + out/
  |  + work/ (temporaly use)
  |  |  +user/
  |  |  |   +META-INF
  |  |  |   +system
  |  |  +temp/
  |  |  |   +framework-res/
  |  |  |   +framework-res-tmp.apk
  |  |  +user.zip  (copy from user)
  |  + complete.zip
  + make_japanized_ROM.wsf
*/
// Folder definition
var SCRIPT_DIR	= String(WScript.ScriptFullName).replace(WScript.ScriptName,"");


//tool path
var TOOL_DIR	= objFso.BuildPath(SCRIPT_DIR	, "tools");
var EXE_7z		= objFso.BuildPath(TOOL_DIR		, "7z.exe");
var APKTOOL		= "java -jar " + objFso.BuildPath(TOOL_DIR		, "apktool.jar");

var SIGNAPK_JAR			= "java -jar " + objFso.BuildPath(TOOL_DIR		, "signapk.jar");
var TESTKEY_X509_PEM	= objFso.BuildPath(TOOL_DIR		, "testkey.x509.pem");
var TESTKEY_PK8			= objFso.BuildPath(TOOL_DIR		, "testkey.pk8");

//working path
var OUT_DIR		= objFso.BuildPath(SCRIPT_DIR	, "out");
var WORK_DIR	= objFso.BuildPath(OUT_DIR		, "work");
var USER_DIR	= objFso.BuildPath(WORK_DIR		, "user");
var TEMP_DIR	= objFso.BuildPath(WORK_DIR		, "temp");

var USER_ZIP	= objFso.BuildPath(WORK_DIR		, "user.zip");

var BUILD_PROP			= "system/build.prop";
var UPDATER_SCRIPT		= "META-INF/com/google/android/updater-script";
var FRAMEWORK_RES		= "system/framework/framework-res.apk";


var WORK_BUILD_PROP			= objFso.BuildPath(USER_DIR				, BUILD_PROP				).replace(new RegExp("\\/","g"),"\\");
var WORK_UPDATER_SCRIPT		= objFso.BuildPath(USER_DIR				, UPDATER_SCRIPT			).replace(new RegExp("\\/","g"),"\\");
var WORK_FRAMEWORK_RES_APK	= objFso.BuildPath(USER_DIR				, FRAMEWORK_RES				).replace(new RegExp("\\/","g"),"\\");

//------
var TMP_FRAMEWORK_DIR		= objFso.BuildPath(TEMP_DIR				, "framework-res"			).replace(new RegExp("\\/","g"),"\\");
var TMP_ARRAYS_XML			= objFso.BuildPath(TMP_FRAMEWORK_DIR	, "res/values/arrays.xml"	).replace(new RegExp("\\/","g"),"\\");
var TMP_FRAMEWORK_APK		= objFso.BuildPath(TEMP_DIR				, "framework-res.apk"		).replace(new RegExp("\\/","g"),"\\");

//------diff
var DIFF_DIR= objFso.BuildPath(SCRIPT_DIR	, "diff");
var DIFF_DIR=objFso.BuildPath(DIFF_DIR,DEVICE_DIR)


SetCurrDir(SCRIPT_DIR);
//get debug parameter
DEBUG_PRINT			= GetArgOnOff(objWshNamed	,"dbg"		,"OFF"				);
DEBUG_PRINT_GUI		= GetArgOnOff(objWshNamed	,"dbg_gui"	,"OFF"				);


if( DEBUG_PRINT== 1)
{
	Log.Loglevel = 3;
}

//=======================================================================================
//
//	replace for jpn device
//
//=======================================================================================
//------------------------------------------------------------------
function replaceProp(src,dst)
{
	var val = getTextFile( src ,"euc-jp");
	val =String(val).replace(new RegExp(" *= ","g")	,"=");	//prop定義の整形

	for(i=0;i<(BUILD_PROP_REP_CONF.length/2 -1);i++)	//exclude dummy line
	{
		Log.d( "[replace prop] :"+BUILD_PROP_REP_CONF[i*2] + " -> "+ BUILD_PROP_REP_CONF[i*2 +1]  );

		val =val.replace(new RegExp(BUILD_PROP_REP_CONF[i*2]+"=.*","g"),
							BUILD_PROP_REP_CONF[i*2]+"="+BUILD_PROP_REP_CONF[i*2 +1]);
	}

	val	+= "\n# Add \n";
	for(i=0;i<(BUILD_PROP_ADD_CONF.length/2 -1);i++)	//exclude dummy line
	{
		val =val.replace(new RegExp(BUILD_PROP_ADD_CONF[i*2]+"=.*","g"),"");
		val	+= BUILD_PROP_ADD_CONF[i*2]+"="+BUILD_PROP_ADD_CONF[i*2 +1]+"\n";
	}


	outputTextFile(dst,val,"euc-jp");
}

//------------------------------------------------------------------
function replaceUpdateScript(src,dst)
{
	var val = getTextFile( src ,"euc-jp");
	for(i=0;i<(UPDATE_SCRIPT_CONF.length/2 -1);i++)	//exclude dummy line
	{
		Log.d( "[replaceUpdateScript] :"+UPDATE_SCRIPT_CONF[i*2] + " -> "+ UPDATE_SCRIPT_CONF[i*2 +1]  );
		val =String(val).replace(new RegExp(UPDATE_SCRIPT_CONF[i*2])	,UPDATE_SCRIPT_CONF[(i*2)+1]);
	}
	outputTextFile(dst,val ,"euc-jp");
}
//------------------------------------------------------------------
function addFelicaResouceItem(src,dst)
{
	var val = getTextFile( src ,"utf-8" );

	//jsなのでxmlアクセスで追加できるけども....
	val =String(val).replace(/<item>clock</,"<item>clock</item>\n<item>felica_lock<");
	outputTextFile(dst,val	,"utf-8" );
}
//=======================================================================================
//
//	file access
//
//=======================================================================================

function getTextFile( fileName ,encoding)
{
	var inputStream = new ActiveXObject("ADODB.Stream");
	inputStream.Type = ADTYPETEXT;
	inputStream.charset = encoding;
	inputStream.Open();
	inputStream.LoadFromFile( fileName );
	var ret = inputStream.ReadText( ADREADALL );
	inputStream.Close();

	return ret;
}


/*text file出力(改行コード変換あり)*/
function outputTextFile( path , val ,encoding)
{
	val =String(val).replace("\r","");	//改行コード変換

	var outputStream = new ActiveXObject("ADODB.Stream");
	outputStream.Type = ADTYPETEXT;
	outputStream.charset = encoding;
	outputStream.Open();
	outputStream.WriteText(val,ADWRITECHAR);
	outputStream.SaveToFile( path , ADSAVECREATEOVERWRITE );
	outputStream.Close();
}

//=======================================================================================
//
//	zip file access
//
//=======================================================================================
//------------------------------------------------------------------
/*zipへファイル追加処理*/
function AddFileToZip(zip,src)
{
	///@todo
	//var cmd = EXE_7z +" a " + zip + " " + src + " -r";
	var cmd = EXE_7z +" u " + zip + " " + src + " -r -ssc";
	run_command(cmd);
}
//------------------------------------------------------------------
/*zipを指定して、指定パスのファイルのみ取り出す処理*/
function getFileFromZip(zip,dst,path)
{
	var cmd = EXE_7z +" x " + zip + " -o"+dst + " " + path + " -r -aoa";
	run_command(cmd);
}
//------------------------------------------------------------------
/*zipを指定して、build.propのみ取り出す処理*/
function getBuildProp(zip,dst)
{
	getFileFromZip(zip,dst,BUILD_PROP);
}
//------------------------------------------------------------------
/*zipを指定して、updater-scriptのみ取り出す処理*/
function getUpdaterScript(zip,dst)
{
	//META-INF\com\google\android
	getFileFromZip(zip,dst,UPDATER_SCRIPT);
}
//------------------------------------------------------------------
/*zipを指定して、framework-res.apkのみ取り出す処理*/
function getFramworkResApk(zip,dst)
{
	getFileFromZip(zip,dst,FRAMEWORK_RES);
}

//=======================================================================================
//
//	tool Access
//
//=======================================================================================
//------------------------------------------------------------------
/*framework-resをデコード処理*/
function decodeFramworkResApk(src,dst)
{
	Log.d( "[decodeFramworkResApk] enter");
	//java -jar ..\tools\apktool.jar d framework-res.apk framework-res
	var cmd = APKTOOL + " d " + src + " "+ dst;
	run_command(cmd);
}
//------------------------------------------------------------------
/*framework-resをビルド処理*/
function buildFramworkResApk(src_dir,tmp_apk,dst_apk)
{
	/*
	java -jar ..\tools\apktool.jar b framework-res framework-res-tmp.apk
	..\tools\7z u -tzip -mx=0 framework-res.apk .\framework-res\build\apk\resources.arsc
	del ..\work1\system\framework\framework-res.apk
	copy framework-res.apk ..\work1\system\framework
	*/
	var resources = objFso.BuildPath(src_dir,"build\\apk\\resources.arsc");

	var cmd = APKTOOL + " b " + src_dir + " "+ tmp_apk;
	run_command(cmd);
	cmd = EXE_7z +" u -tzip -mx=0 " + dst_apk + " " + resources;

	run_command(cmd);
}
//------------------------------------------------------------------
/*signed zip処理*/
function signZip(src,dst)
{
	var cmd = SIGNAPK_JAR + " " + TESTKEY_X509_PEM + " " + TESTKEY_PK8 + " " +src+ " " + dst;
	run_command(cmd);
}

//=======================================================================================
//
//	other
//
//=======================================================================================
function show_copyright()
{
//make_japanized_ROM

}


function prepear_work()
{

	if (objWshUnnamed.Count == 0)
	{	WScript.Echo("ERROR! Please input zip");
		return "";
	}
	var rom_zip = objWshUnnamed.Item(0);

	if(!objFso.FileExists(rom_zip))
	{
		WScript.Echo("ERROR! not exist rom");
		return "";
	}

	var ext = objFso.GetExtensionName(rom_zip);
	if(ext != "zip" )
	{
		WScript.Echo("ERROR! not .zip file");
		return "";
	}

	//Init Dir
	if(!objFso.FolderExists(OUT_DIR))
	{
		objFso.CreateFolder(OUT_DIR);
	}
	else
	{
		cleanup_work();
	}
	objFso.CreateFolder(WORK_DIR);
	objFso.CreateFolder(USER_DIR);
	
	objFso.CopyFile(rom_zip,USER_ZIP,true);

//	return objFso.GetFileName(rom_zip);

	var zipName = objFso.GetFileName(rom_zip);
	

	return zipName.replace("."+ext,"");

}

function cleanup_work()
{
	if(objFso.FolderExists(WORK_DIR))
	{
		objFso.DeleteFolder(WORK_DIR,true);
	}
}
//=======================================================================================
//
//	main process
//
//=======================================================================================
//------------------------------------------------------------------
function japanize_process()
{
	//copy to work from user seleced zip here

	var zip_name = prepear_work();
	
	if(zip_name=="")
	{
		cleanup_work();
		WScript.quit();
	}
	Log.i( "\n****処理を開始します" );
	Log.i("Input File : " + zip_name + ".zip");

	Log.i( "\n****build prop convert for" + DEVICE_NAME );
	getBuildProp(USER_ZIP,USER_DIR);
	replaceProp(WORK_BUILD_PROP,WORK_BUILD_PROP);	//debug

	Log.i( "\n****updater-script convert for" + DEVICE_NAME );

	getUpdaterScript(USER_ZIP,USER_DIR);
	replaceUpdateScript(WORK_UPDATER_SCRIPT,WORK_UPDATER_SCRIPT);

	Log.i( "\n****framwork-res.apkをデコードします" );

	getFramworkResApk(USER_ZIP,USER_DIR);
	decodeFramworkResApk(WORK_FRAMEWORK_RES_APK,TMP_FRAMEWORK_DIR);
	
	Log.i( "\n****framwork-res.apkのFelica対応をします" );
	addFelicaResouceItem(TMP_ARRAYS_XML,TMP_ARRAYS_XML);

	Log.i( "\n****framwork-res.apkをエンコードします" );
	buildFramworkResApk(TMP_FRAMEWORK_DIR,TMP_FRAMEWORK_APK,WORK_FRAMEWORK_RES_APK);

	//apply diff files

	Log.i( "\n****差分ファイルを適用します" );
	for(i=0;i<(DIFF_DIR_CONF.length-1);i++)	//exclude dummy line
	{
		var diff_dir = objFso.BuildPath(DIFF_DIR	, DIFF_DIR_CONF[i]);
		//Log.d( "update from " + diff_dir );
		if(objFso.FolderExists(diff_dir))
		{
			var src = objFso.BuildPath(diff_dir,"*");
			Log.d( "update from " + src );
			AddFileToZip(USER_ZIP, src );
		}
		else
		{
			Log.d( "not exist " + diff_dir[i] );
		}
	}
	
	Log.i( "\n****変換したファイルを適用します" );
	//apply japanize files
	AddFileToZip(USER_ZIP,USER_DIR+"\\*");

	Log.i( "\n****CWM update zipを作成します" );
	var outbase = zip_name+"-for-"+DEVICE_NAME;
	var outzip = objFso.BuildPath(OUT_DIR, outbase+".zip");
	signZip(USER_ZIP,outzip)

	Log.i( "\n****作業ファイルのクリーンアップします" );
	//cleanup
	cleanup_work();
	Log.i("\n****処理が完了しました。出力先は\n"+ outzip +"\nです"); 
	Log.i( "お疲れ様でした！" );
	
}
