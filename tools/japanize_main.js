//==================================================================
// Internal use only (do not edit here)
var SCRIPT_DIR	= String(WScript.ScriptFullName).replace(WScript.ScriptName,"");
var objFso		= WScript.CreateObject("Scripting.FileSystemObject") ;

var objWshNamed	 	= WScript.Arguments.Named;
var	objWshUnnamed	= WScript.Arguments.Unnamed;

//  オープンモード
var FORREADING      = 1;    // 読み取り専用
var FORWRITING      = 2;    // 書き込み専用
var FORAPPENDING    = 8;    // 追加書き込み

//  開くファイルの形式
var TRISTATE_TRUE       = -1;   // Unicode
var TRISTATE_FALSE      =  0;   // ASCII
var TRISTATE_USEDEFAULT = -2;   // システムデフォルト
//==================================================================
/*==================================================================
Memo:

<any_place>
  + diff
  |  + system
  |  |  + xxxx
  |  + boot.img
  + tool   
  |  +7z.exe
  |  +appt.exe
  |  + etc...
  + out
  |  + work (temporaly use)
  |  |  +temp
  |  |  |   +META-INF
  |  |  |   +system
  |  |  +temp.zip  (copy from user)
  |  + complete.zip
  + test.js (this file)
*/

DEBUG_PRINT			= GetArgOnOff(objWshNamed	,"dbg"		,"OFF"				);
DEBUG_PRINT_GUI		= GetArgOnOff(objWshNamed	,"dbg_gui"	,"OFF"				);
//=======================================================================================
//
//	replace for jpn device
//
//=======================================================================================
//------------------------------------------------------------------
function replaceProp(src,dst)
{
	var val = getTextFile( src );
	val =String(val).replace(/ *= /	,"=");	//prop定義の整形

	val =val.replace(/ro.product.model=.*/	,"ro.product.model="+ro_product_model);
	val =val.replace(/ro.product.brand=.*/	,"ro.product.brand="+ro_product_brand);
	val =val.replace(/ro.product.name=.*/	,"ro.product.name="+ro_product_name);
	val =val.replace(/ro.product.device=.*/	,"ro.product.device="+ro_product_device);
	val =val.replace(/ro.product=.*/		,"ro.product="+ro_product);

	val =val.replace(/ro.build.description=.*/	,"ro.build.description="+ro_build_description);
	val =val.replace(/ro.build.fingerprint=.*/	,"ro.build.fingerprint="+ro_build_fingerprint);
	val =val.replace(/ro.factory.model=.*/		,"ro.factory.model="+ro_factory_model);

	val =val.replace(/ro.config.*=.*/		,"");

	val	+= "\n# Add \n";
	val	+= "ro.config.libemoji=libemoji_docomo.so\n";

	outputTextFile(dst,val);
}

//------------------------------------------------------------------
function replaceUpdateScript(src,dst)
{
	var val = getTextFile( src );
	for(i=0;i<(UPDATE_SCRIPT_CONF.lenght/2 -1);i++)	//exclude dummy line
	{
		val =String(val).replace(UPDATE_SCRIPT_CONF[i*2]	,UPDATE_SCRIPT_CONF[(i*2)+1]);
	}
	outputTextFile(dst,val);
}
//------------------------------------------------------------------
function addFelicaResouceItem(src,dst)
{
	var val = getTextFile( src );

	//jsなのでxmlアクセスで追加できるけども....
	val =String(val).replace(/<item>clock</,"<item>clock</item>\n<item>felica_lock</item>");
	outputTextFile(dst,val);
}
//=======================================================================================
//
//	file access
//
//=======================================================================================
function getTextFile( fileName )
{
	var objTxt	= objFso.OpenTextFile(fileName, FORREADING, false, TRISTATE_USEDEFAULT);
	var ret		= objTxt.ReadAll();
	objTxt.Close();
	return ret;
}

/*text file出力(改行コード変換あり)*/
function outputTextFile( path , val )
{
	val =String(val).replace("\r","");	//改行コード変換

	var file = objFso.OpenTextFile( path, FORWRITING, true, TRISTATE_FALSE );
	file.Write(val);
	file.Close();
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
}
//------------------------------------------------------------------
/*zipを指定して、指定パスのファイルのみ取り出す処理*/
function getFileFromZip(src,dst,path)
{
	///@todo
}
//------------------------------------------------------------------
/*zipを指定して、build.propのみ取り出す処理*/
function getBuildProp(src,dst)
{
	getFileFromZip(src,dst,"system/build.prop");
}
//------------------------------------------------------------------
/*zipを指定して、updater-scriptのみ取り出す処理*/
function getUpdaterScript(src,dst)
{
	getFileFromZip(src,dst,"META-INF/com\google/android/updater-script");
}
//------------------------------------------------------------------
/*zipを指定して、framework-res.apkのみ取り出す処理*/
function getFramworkResApk(src,dst)
{
	getFileFromZip(src,dst,"system/framework/framework-res.apk");
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
	///@todo
}
//------------------------------------------------------------------
/*framework-resをビルド処理*/
function buildFramworkResApk(src,dst)
{
	///@todo
}
//------------------------------------------------------------------
/*signed zip処理*/
function signZip(src,dst)
{
	///@todo
	/*
	java -jar ..\tools\apktool.jar b framework-res framework-res-tmp.apk
	..\tools\7z u -tzip -mx=0 framework-res.apk .\framework-res\build\apk\resources.arsc
	del ..\work1\system\framework\framework-res.apk
	copy framework-res.apk ..\work1\system\framework
	*/
}

//=======================================================================================
//
//	tool Access
//
//=======================================================================================
function show_copyright()
{
//make_japanized_ROM

}

//=======================================================================================
//
//	main process
//
//=======================================================================================
//------------------------------------------------------------------
function japanize_process()
{
	//for Test
	var prop	= SCRIPT_DIR + "build.prop"
	var update	= SCRIPT_DIR + "updater-script"
	var xml		= SCRIPT_DIR + "arrays.xml"


	//copy to work from user seleced zip here

	//getBuildProp(src,dst);
	replaceProp(prop,prop+"2");
	//AddFileToZip(zip,src)

	//getUpdaterScript(src,dst);
	//replaceUpdateScript(update,update+"2")
	//AddFileToZip(zip,src)

	//getFramworkResApk(src,dst);
	//addFelicaResouceItem(xml,xml+"2")
	//buildFramworkResApk(src,dst)
	//AddFileToZip(zip,src)


	//AddFileToZip(zip,src);	//diff/system
	//AddFileToZip(zip,src);	//boot.img

	//signZip(src,dst)

}
