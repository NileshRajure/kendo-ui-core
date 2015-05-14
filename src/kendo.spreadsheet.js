(function(f, define){
    define([
        "./spreadsheet/rangelist",
        "./spreadsheet/sheet",
        "./spreadsheet/view",
        "./spreadsheet/grid",
        "./spreadsheet/axis",
        "./spreadsheet/sorter"
    ], f);
})(function(){
    var __meta__ = {
        id: "spreadsheet",
        name: "Spreadsheet",
        category: "web",
        description: "Spreadsheet component",
        depends: [],
        features: []
    };

    var Widget = kendo.ui.Widget,
        FIXED = false;

    var Spreadsheet = kendo.ui.Widget.extend({
        init: function(element, options) {
            Widget.fn.init.call(this, element, options);

            this._view = new kendo.spreadsheet.View(this.element, FIXED);
            this._sheet = new kendo.spreadsheet.Sheet(this.options.columns,
                this.options.rows, this.options.columnWidth, this.options.rowHeight, FIXED);
            this._view.sheet(this.activeSheet());
            this.refresh();
        },

        refresh: function() {
            this._view.render();
        },

        activeSheet: function() {
            return this._sheet;
        },

        options: {
            name: "Spreadsheet",
            rows: 200,
            columns: 50,
            rowHeight: 20,
            columnWidth: 64
        }
    });

    kendo.ui.plugin(Spreadsheet);
}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });
