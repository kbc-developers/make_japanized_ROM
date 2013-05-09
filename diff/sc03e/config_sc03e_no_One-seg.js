//==================================================================
// Config for SC02E
/*---------------------------------------------------------------------------**
	for japanize internal
**---------------------------------------------------------------------------*/
var DEVICE_NAME="sc03e";
var DEVICE_DIR="sc03e";
/*---------------------------------------------------------------------------**
	for Build Prop
**---------------------------------------------------------------------------*/
var BUILD_PROP_REP_CONF = new Array(
	"ro.product.model"		,"SC-03E",
	"ro.product.brand"		,"samsung",
	"ro.product.name"		,"SC-03E",
	"ro.product.device"		,"m3",
	"ro.product"			,"m3",
	"ro.build.description"	,"m3dcm-user 4.1.1 JRO03C SC03EOMAMB1 release-keys",
	"ro.build.fingerprint"	,"samsung/SC-03E/SC-03E:4.1.1/JRO03C/SC03EOMAMB1:user/release-keys",
	"ro.factory.model"		,"SGH-N035",

//	"ro.config.*"			,"",
	//-------------------------------------
	"DUMMY","DUMMY"//<-最後はカンマ付けない
);

//add to last line
var BUILD_PROP_ADD_CONF = new Array(
	"ro.config.libemoji"	,"libemoji_docomo.so",
	"com.qc.hdmi_out"		,"true",
	"ro.hdmi.enablet"		,"true",
	//-------------------------------------
	"DUMMY","DUMMY"//<-最後はカンマ付けない
);

/*---------------------------------------------------------------------------**
	for updeter-script
**---------------------------------------------------------------------------*/
var UPDATE_SCRIPT_CONF = new Array(
	"GT-I9305"	,"SC-03E",
	"i9305"		,"sc03e",
	//-------------------------------------
	"DUMMY","DUMMY"//<-最後はカンマ付けない
);

/*---------------------------------------------------------------------------**
	for diff files
**---------------------------------------------------------------------------*/
var DIFF_DIR_CONF = new Array(
	"common"		,
	"felica"		,
//	"one-seg"		,
	//------------------------
	"DUMMY"//<- last item not need ","
);



