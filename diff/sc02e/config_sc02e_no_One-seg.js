//==================================================================
// Config for SC02E
/*---------------------------------------------------------------------------**
	for japanize internal
**---------------------------------------------------------------------------*/
var DEVICE_NAME="sc02e";
var DEVICE_DIR="sc02e";


/*---------------------------------------------------------------------------**
	for Build Prop
**---------------------------------------------------------------------------*/
var BUILD_PROP_REP_CONF = new Array(
	"ro.product.model"		,"SC-02E",
	"ro.product.brand"		,"samsung",
	"ro.product.name"		,"SC-02E",
	"ro.product.device"		,"sc02e",
	"ro.product"			,"sc02e",
	"ro.build.description"	,"t0ltedcm-user 4.1.1 JRO03C SC02EOMALJF release-keys",
	"ro.build.fingerprint"	,"samsung/SC-02E/SC-02E:4.1.1/JRO03C/SC02EOMALJF:user/release-keys",
	"ro.factory.model"		,"SGH-N025",

	"ro.config.*"			,"",
	//-------------------------------------
	"DUMMY","DUMMY"//<- last item not need ","
);

//add to last line
var BUILD_PROP_ADD_CONF = new Array(
	"ro.config.libemoji"	,"libemoji_docomo.so",

	//-------------------------------------
	"DUMMY","DUMMY"//<- last item not need ","
);

/*---------------------------------------------------------------------------**
	for updeter-script
**---------------------------------------------------------------------------*/
var UPDATE_SCRIPT_CONF = new Array(
	"GT-N7105"	,"SC-02",
	"t0lte"		,"sc02e",
	"SGH-I317"	,"SC-02",
	"t0lteatt"	,"sc02e",
	"SGH-T889"	,"SC-02",
	"t0ltetmo"	,"sc02e",

	//-------------------------------------
	"DUMMY","DUMMY"//<-ÅŒã‚ÍƒJƒ“ƒ}•t‚¯‚È‚¢
);
/*---------------------------------------------------------------------------**
	for diff files
**---------------------------------------------------------------------------*/
var DIFF_DIR_CONF = new Array(
	"common"		,
	"felica"		,

	//------------------------
	"DUMMY"//<- last item not need ","
);
