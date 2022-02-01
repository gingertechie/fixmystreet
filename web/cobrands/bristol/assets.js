(function(){

if (!fixmystreet.maps) {
    return;
}

// Assets are served from two different WFS feeds; one for lighting and one
// for everything else. They have some options in common:
var options = {
    max_resolution: {
        'bristol': 0.33072982812632296,
        'fixmystreet': 4.777314267158508
    },
    asset_type: 'spot',
    body: "Bristol City Council",
    srsName: "EPSG:27700",
    geometryName: 'SHAPE',
    wfs_url: "https://maps.bristol.gov.uk/arcgis/services/ext/FixMyStreetSupportData/MapServer/WFSServer",
    wfs_feature: "COD_ASSETS_POINT",
    asset_id_field: 'COD_ASSET_ID',
    propertyNames: [ 'COD_ASSET_ID', 'COD_USRN', 'SHAPE' ],
    filter_key: 'COD_ASSET_TYPE',
    attributes: {
        asset_id: 'COD_ASSET_ID',
        usrn: 'COD_USRN'
    }
};

// This is required so that the found/not found actions are fired on category
// select and pin move rather than just on asset select/not select.
OpenLayers.Layer.BristolVectorAsset = OpenLayers.Class(OpenLayers.Layer.VectorAsset, {
    initialize: function(name, options) {
        OpenLayers.Layer.VectorAsset.prototype.initialize.apply(this, arguments);
        $(fixmystreet).on('maps:update_pin', this.checkSelected.bind(this));
        $(fixmystreet).on('report_new:category_change', this.checkSelected.bind(this));
    },

    CLASS_NAME: 'OpenLayers.Layer.PeterboroughVectorAsset'
});

var parkOptions = $.extend(true, {}, options, {
    filter_key: '',
    wfs_url: 'https://tilma.staging.mysociety.org/mapserver/bristol',
    wfs_feature: "parks",
    propertyNames: [ ].push( 'SITE_CODE', 'SITE_NAME'),
    asset_type: 'area',
    asset_id_field: 'SITE_CODE',
    srsName: "EPSG:3857",
    class: OpenLayers.Layer.BristolVectorAsset,
    strategy_class: OpenLayers.Strategy.FixMyStreet,
    select_action: true,
    actions: {
        asset_found: function(asset) {
            fixmystreet.message_controller.asset_found.call(this);
        },
        asset_not_found: function(layer, asset) {
            fixmystreet.message_controller.asset_not_found.call(this);
        }
    }
});



fixmystreet.assets.add(parkOptions, {
    asset_group: "Parks Maintenance",
    asset_item: 'park',
});

fixmystreet.assets.add(parkOptions, {
    asset_category: "Path Cleaning",
});

fixmystreet.assets.add(options, {
    filter_key: '',
    wfs_feature: "COD_ASSETS_AREA",
    asset_type: 'area',
    asset_category: "Bridges/Subways",
    asset_item: 'bridge/subway'
});

fixmystreet.assets.add(options, {
    asset_category: "Grit Bins",
    asset_item: 'grit bin',
    filter_value: 'GRITBIN'
});

fixmystreet.assets.add(options, {
    asset_category: "Flooding",
    asset_item: 'flood risk structure',
    filter_value: 'FRST'
});

fixmystreet.assets.add(options, {
    asset_category: "Street Light",
    asset_item: 'street light',
    filter_value: [ 'S070', 'S080', 'S100', 'S110', 'S120', 'S170', 'S220', 'S230' ]
});

fixmystreet.assets.add(options, {
    asset_category: "Zebra Crossing Light",
    asset_item: 'light',
    filter_value: 'S260'
});

// NB there's a typo in BCC's ‘Iluminated Bollard’ category so this
// includes the correct spelling just in case they fix it.
fixmystreet.assets.add(options, {
    asset_category: [ "Iluminated Bollard", "Illuminated Bollard" ],
    asset_item: 'bollard',
    filter_value: 'S020'
});

fixmystreet.assets.add(options, {
    asset_category: "Illuminated Sign",
    asset_item: 'sign',
    filter_value: 'S180'
});

fixmystreet.assets.add(options, {
    asset_group: "Bus Stops",
    asset_item: 'bus stop',
    filter_value: ['PT01', 'PT02', 'PT03']
});

fixmystreet.assets.add(options, {
    asset_category: "Flooding/Gully/Drainage",
    asset_item: 'gully or drain',
    filter_value: ['GULLY', 'FR02', 'FR03', 'FR07', 'FR18', 'FR10', 'FR16', 'FR14', 'FR13', 'FR06', 'FR09', 'FR12', 'FR15', 'FR08', 'FR11', 'FR20', 'FR19']
});

fixmystreet.assets.add(options, {
    asset_group: "Trees",
    asset_item: 'tree',
    filter_value: 'TR'
});

fixmystreet.assets.add(options, {
    asset_category: ["Bin Full", "Bin/Seat Damage"],
    asset_item: 'bin',
    filter_value: 'PF'
});

fixmystreet.assets.add(options, {
    asset_category: "Noticeboard/Signs",
    asset_item: 'sign',
    filter_value: 'PS'
});

})();
