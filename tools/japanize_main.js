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
  |  |  +ggaps/
  |  |  |   +META-INF
  |  |  |   +system
  |  |  |   +xxx
  |  |  +user.zip  (copy from user)
  |  + complete.zip
  + make_japanized_ROM.wsf
*/
// Folder definition
var SCRIPT_DIR	= String(WScript.ScriptFullName).replace(WScript.ScriptName,"");


//tool path
var TOOL_DIR	= objFso.BuildPath(SCRIPT_DIR	, "tools");
var EXE_7z		= escape_path(objFso.BuildPath(TOOL_DIR		, "7z.exe"));
var APKTOOL		= "java -jar " + escape_path(objFso.BuildPath(TOOL_DIR		, "apktool.jar"));

var SIGNAPK_JAR			= "java -jar " + escape_path(objFso.BuildPath(TOOL_DIR		, "signapk.jar"));
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

//ggaps work
var GGAPS_DIR	= objFso.BuildPath(SCRIPT_DIR		, "ggaps");
var WORK_GGAPS_DIR	= objFso.BuildPath(WORK_DIR		, "ggaps");
var GAPS_UPDATER_SCRIPT		= objFso.BuildPath(WORK_GGAPS_DIR				, UPDATER_SCRIPT			).replace(new RegExp("\\/","g"),"\\");

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
	var cmd = EXE_7z +" u " + 
			escape_path(zip) + 	" " + 
			escape_path(src) + " -r -ssc";
	run_command(cmd);
}
//------------------------------------------------------------------
/*zipを指定して、指定パスのファイルのみ取り出す処理*/
function getFileFromZip(zip,dst,path)
{
	var cmd = EXE_7z +" x " +
	escape_path(zip) + " -o" + 
	escape_path(dst) + " " + 
	escape_path(path) + " -r -aoa";
	run_command(cmd);
}
//------------------------------------------------------------------
/*zipを指定して、指定パスのファイルのみ取り出す処理*/
function extractZipAll(zip,dst)
{
	var cmd = EXE_7z +" x " +
	escape_path(zip) + " -o" + 
	escape_path(dst) + " -r -aoa";
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
	var cmd = APKTOOL + " d " + escape_path(src) + " "+ escape_path(dst);
	run_command(cmd);
}
//------------------------------------------------------------------
/*framework-resをビルド処理*/
function buildFramworkResApk(src_dir,tmp_apk,dst_apk)
{
	var resources = escape_path(objFso.BuildPath(src_dir,"build\\apk\\resources.arsc"));

	var cmd = APKTOOL + " b " + escape_path(src_dir) + " "+ escape_path(tmp_apk);
	run_command(cmd);
	cmd = EXE_7z +" u -tzip -mx=0 " + escape_path(dst_apk) + " " + resources;

	run_command(cmd);
}
//------------------------------------------------------------------
/*signed zip処理*/
function signZip(src,dst)
{
	var cmd =	SIGNAPK_JAR + " " +
				escape_path(TESTKEY_X509_PEM )+ " " +
				escape_path(TESTKEY_PK8) + " " +
				escape_path(src)+ " " + 
				escape_path(dst);
	run_command(cmd);
}
//=======================================================================================
//
//	ggaps merge
//
//=======================================================================================
function merge_ggaps()
{
	var zip_path = null;
	var files = new Enumerator( objFso.GetFolder(GGAPS_DIR).files );
	for (; !files.atEnd(); files.moveNext()){
		var file_path = files.item().path;  //ファイルのパス;

		Log.d("[detect] fiile: " + file_path);
		if( objFso.GetExtensionName(file_path) == "zip" )
		{
			Log.d("[detect] zip : " + file_path);
			zip_path = file_path;
			break;
		}
	}

	if( zip_path == null )
	{
		Log.d("not detect ggaps zip");
		return ; //do nothing
	}

	progressPrint( "ggpsを統合します" );
	Log.i("src file : " + zip_path);
	
	getUpdaterScript(zip_path,WORK_GGAPS_DIR);
	var text 		 = getTextFile( GAPS_UPDATER_SCRIPT ,"euc-jp");
	var updateScript = getTextFile( WORK_UPDATER_SCRIPT ,"euc-jp");

	text =text.replace(new RegExp("package_extract_dir\\(.*system\".*,","g"),
							"package_extract_dir(\"system_ggaps\" ,"	);
	updateScript +=  "\n" + text;
	
	//add script to user/META..../updater-script
	outputTextFile(WORK_UPDATER_SCRIPT,updateScript ,"euc-jp");
	
	extractZipAll(zip_path,WORK_GGAPS_DIR);
	// X system -> system_ggaps  rename
	objFso.GetFolder(objFso.BuildPath(WORK_GGAPS_DIR	, "system")).Name	= "system_ggaps";

	objFso.GetFolder(objFso.BuildPath(WORK_GGAPS_DIR	, "META-INF")).Delete();

	//	ggaps/* copy to user/
	objFso.CopyFolder( objFso.BuildPath(WORK_GGAPS_DIR	, "*") , USER_DIR,true);
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
	{	
		Log.e("ERROR! Please input zip");
		return "";
	}
	var rom_zip = objWshUnnamed.Item(0);

	if(!objFso.FileExists(rom_zip))
	{
		Log.e("ERROR! not exist rom");
		return "";
	}

	var ext = objFso.GetExtensionName(rom_zip);
	if(ext != "zip" )
	{
		Log.e("ERROR! not .zip file");
		return "";
	}

	//Init Dir
	if(!objFso.FolderExists(OUT_DIR))
	{
		objFso.CreateFolder(OUT_DIR);
	}
	cleanup_work();

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
	
	var retry = 0;
	while(objFso.FolderExists(WORK_DIR))
	{
		if( retry == 10 )
		{
			Lod.e("work dirを削除出来ません");
			Wscript.Quit(1);
		}
		WScript.Sleep(500);
		retry++;
	}
	
}
//=======================================================================================
//
//	main process
//
//=======================================================================================
function progressPrint( string )
{
	var str =  "\n";

	str += "\n"+ "-----------------------------------------------";
	str += "\n"+ " " + string;
	str += "\n"+ "-----------------------------------------------\n";
	Log.i(str);
}
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
	progressPrint( "Starrt Japanize for "  + DEVICE_NAME  );
	Log.i("Input File : " + zip_name + ".zip");

	progressPrint("build prop convert for" + DEVICE_NAME );
	getBuildProp(USER_ZIP,USER_DIR);
	replaceProp(WORK_BUILD_PROP,WORK_BUILD_PROP);	//debug

	progressPrint( "updater-script convert for" + DEVICE_NAME );

	getUpdaterScript(USER_ZIP,USER_DIR);
	replaceUpdateScript(WORK_UPDATER_SCRIPT,WORK_UPDATER_SCRIPT);

	progressPrint( "framwork-res.apkをデコードします" );

	getFramworkResApk(USER_ZIP,USER_DIR);
//	decodeFramworkResApk(WORK_FRAMEWORK_RES_APK,TMP_FRAMEWORK_DIR);
	
	progressPrint( "framwork-res.apkのFelica対応をします" );
//	addFelicaResouceItem(TMP_ARRAYS_XML,TMP_ARRAYS_XML);

	progressPrint( "framwork-res.apkをエンコードします" );
//	buildFramworkResApk(TMP_FRAMEWORK_DIR,TMP_FRAMEWORK_APK,WORK_FRAMEWORK_RES_APK);

	//apply diff files

	progressPrint("差分ファイルを適用します" );
	for(i=0;i<(DIFF_DIR_CONF.length-1);i++)	//exclude dummy line
	{
		var diff_dir = objFso.BuildPath(DIFF_DIR	, DIFF_DIR_CONF[i]);
		//Log.d( "update from " + diff_dir );
		if(objFso.FolderExists(diff_dir))
		{
			var src = objFso.BuildPath(diff_dir,"*");
			Log.d( "update from " + src );

			//AddFileToZip(USER_ZIP, src );
			objFso.CopyFolder( src , USER_DIR,true);
			objFso.CopyFile( src , USER_DIR,true);
		}
		else
		{
			Log.d( "not exist " + diff_dir[i] );
		}
	}
	
	//GGAPSをマージ　実装中
	merge_ggaps();
	
	Wscript.quit(1);
	
	progressPrint( "変換したファイルを適用します" );
	//apply japanize files
	AddFileToZip(USER_ZIP,USER_DIR+"\\*");

	progressPrint( "CWM update zipを作成します" );
	var outbase = zip_name+"-for-"+DEVICE_NAME;
	var outzip = objFso.BuildPath(OUT_DIR, outbase+".zip");
	signZip(USER_ZIP,outzip)

	progressPrint( "作業ファイルのクリーンアップします" );
	//cleanup
	cleanup_work();
	progressPrint("処理が完了しました"); 
	Log.i( "出力先は\n"+ outzip +"\nです" );
	Log.i( "お疲れ様でした！" );
	
}
