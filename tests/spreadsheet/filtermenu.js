(function() {
    var Pane = kendo.spreadsheet.Pane;
    var Sheet = kendo.spreadsheet.Sheet;
    var RangeRef = kendo.spreadsheet.RangeRef;
    var CellRef = kendo.spreadsheet.CellRef;

    module("filter header rendering", {
        setup: function() {
            sheet = new Sheet(1000, 100, 10, 10, 10, 10);
        }
    });

    function createPane(row, column, rowCount, columnCount) {
        var pane = new Pane(sheet, sheet._grid.pane({
            row: row,
            column: column,
            rowCount: rowCount,
            columnCount: columnCount
        }));

        pane._currentView = DUMMY_VIEW;

        return pane;
    }

    function rangeRef(topLeftRow, topLeftCol, bottomRightRow, bottomRightCol) {
        var ref = new RangeRef(
            new CellRef(topLeftRow, topLeftCol),
            new CellRef(bottomRightRow, bottomRightCol)
        );

        return ref;
    }

    function filterButtons(pane) {
        return pane.renderFilterHeaders().children.filter(function(node) {
            return /k-spreadsheet-filter/.test(node.attr.className);
        });
    }

    var DUMMY_VIEW = { ref: rangeRef(0,0, 100, 100), top: 0, left: 0 };

    test("renders in top filtered cell", function() {
        var pane = createPane(0, 0);

        sheet.range("A1:A5").filter({
            column: 0,
            filter: new kendo.spreadsheet.ValueFilter({
                values: [3]
            })
        });

        equal(filterButtons(pane).length, 1);
    });

    test("renders icons for each column", function() {
        var pane = createPane(0, 0);

        sheet.range("A5:C5").filter({
            column: 0,
            filter: new kendo.spreadsheet.ValueFilter({
                values: [3]
            })
        });

        equal(filterButtons(pane).length, 3);
    });

    test("does not render filter buttons if no filter is set", function() {
        var pane = createPane(0, 0);

        equal(filterButtons(pane).length, 0);
    });

    test("adds k-state-active to buttons with applied filtering", function() {
        var pane = createPane(0, 0);

        sheet.range("A2:B5").filter({
            column: 0,
            filter: new kendo.spreadsheet.ValueFilter({
                values: [3]
            })
        });

        var buttons = filterButtons(pane);

        ok(buttons[0].attr.className.indexOf("k-state-active") >= 0);
    });

    var defaults = kendo.ui.Spreadsheet.prototype.options;
    var range;
    var sheet;
    var filterMenu;
    var element;

    function createWithValues(values, ref) {
        range = sheet.range(ref || "A1:A4").values(values);
        element = $("<div />").appendTo(QUnit.fixture);
        return new kendo.spreadsheet.FilterMenu(element, { range: range });
    }

    module("filter menu: filter by value", {
        setup: function() {
            sheet = new kendo.spreadsheet.Sheet(4, 4, defaults.rowHeight, defaults.columnWidth);
        },
        teardown: function() {
            if (filterMenu) {
                filterMenu.destroy();
                filterMenu = null;
            }
        }
    });

    test("creates TreeView", function() {
        filterMenu = createWithValues([ ["A1"], ["A2"], ["A3"] ]);
        ok(filterMenu.valuesTreeView instanceof kendo.ui.TreeView);
    });

    test("stores valuesTreeView dataSource in the viewModel", function() {
        filterMenu = createWithValues([ ["A1"], ["A2"], ["A3"] ]);
        ok(filterMenu.viewModel.valuesDataSource instanceof kendo.data.HierarchicalDataSource);
    });

    test("loads range values in TreeView", function() {
        filterMenu = createWithValues([ ["header"], ["A2"], ["A3"], ["A4"] ]);
        var data = filterMenu.valuesTreeView.dataSource.data();

        equal(data.length, 1, "has only one 'all' rote node");

        var root = data[0];
        var children = root.children.data();

        equal(children.length, 3, "values are listed under the root node");

        equal(children[0].text, "A2");
        equal(children[1].text, "A3");
        equal(children[2].text, "A4");
    });

    var controller = kendo.spreadsheet.FilterMenuController;

    test("gets the text (formatted) of each value", function() {
        var range = sheet.range("A1:A3");

        sheet.range("A1").value(12).format("$#");
        sheet.range("A2").value(new Date(2015, 1, 1)).format("dd/MMM/yyyy");
        sheet.range("A3").value(0.01).format("0%");

        var values = controller.values(range, 0);

        equal(values[0].text, "$12");
        equal(values[1].text, "1%");
        equal(values[2].text, "01/Feb/2015");
    });

    test("gets only distinct values", function() {
        var range = sheet.range("A1:A3").values([ ["aaa"], ["bbb"], ["aaa"] ]);

        var values = controller.values(range, 0);

        equal(values.length, 2, "distinct values are loaded");
        equal(values[0].text, "aaa");
        equal(values[1].text, "bbb");
    });

    test("gets empty values", function() {
        var range = sheet.range("A1:A2").values([ [], ["A2"] ]);

        var values = controller.values(range, 0);

        equal(values[0].text, "(Blanks)");
        equal(values[1].text, "A2");
    });

    test("wrap property is trimmed from values", function() {
        var range = sheet.range("A1:A3").values([ ["A1"], ["A2"], ["A3"] ]).wrap(true);

        var values = controller.values(range, 0);

        ok(!values[0].hasOwnProperty("wrap"));
        ok(!values[1].hasOwnProperty("wrap"));
    });

    test("recognizes number dataType", function() {
        var range = sheet.range("A1").value(123);

        var values = controller.values(range, 0);

        equal(values[0].dataType, "number");
    });

    test("recognizes values with percent format as number dataType", function() {
        var range = sheet.range("A1").value(0.01).format("0%");

        var values = controller.values(range, 0);

        equal(values[0].dataType, "number");
    });

    test("recognizes date dataType", function() {
        var range = sheet.range("A1").value(new Date(2015,1,1)).format("dd/mm/yyyy");

        var values = controller.values(range, 0);

        equal(values[0].dataType, "date");
    });

    test("recognizes string dataType", function() {
        var range = sheet.range("A1").value("A1");

        var values = controller.values(range, 0);

        equal(values[0].dataType, "string");
    });

    test("recognizes blank dataType", function() {
        var range = sheet.range("A1");

        var values = controller.values(range, 0);

        equal(values[0].dataType, "blank");
    });

    test("filterType returns null for empty range", function() {
        var range = sheet.range("A1:A2").filter(true);

        var type = controller.filterType(range, 0);

        equal(type, null);
    });

    test("filterType returns null for empty range", function() {
        var range = sheet.range("A1:A2").filter(true);

        sheet.range("A2").value(new Date(2015,1,1)).format("dd/mm/yyyy");

        var type = controller.filterType(range, 0);

        equal(type, "date");
    });

    test("filterType returns number for range with number", function() {
        var range = sheet.range("A1:A2").filter(true);

        sheet.range("A2").value(42);

        var type = controller.filterType(range, 0);

        equal(type, "number");
    });

    test("filter returns active custom filter", function() {
        sheet.range("A1:A3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "eq", value: 11 }
                ]
            })
        });

        var filter = controller.filter(0, sheet);

        equal(filter.type, "custom");
    });

    test("sorts the values according to their dataType (blank, number, date, string)", function() {
        sheet.range("A1").value(new Date(2015,1,1)).format("dd/mm/yyyy");
        sheet.range("A2").value(123);
        sheet.range("A3");

        var range = sheet.range("A1:A3");

        var values = controller.values(range, 0);

        equal(values[0].dataType, "blank");
        equal(values[1].dataType, "number");
        equal(values[2].dataType, "date");
    });

    function rangeWithCustomFilter(ref, values, criteria) {
        return sheet.range(ref).values(values).filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [ criteria ]
            })
        });
    }

    function rangeWithValuesFilter(ref, values, filter) {
        return sheet.range(ref).values(values).filter({
            column: 0,
            filter: new kendo.spreadsheet.ValueFilter({
                values: filter
            })
        });
    }

    test("values that do not match existing custom filter rules appear as unchecked", function() {
        var filterMenuRange = rangeWithCustomFilter("A1:A4", [ ["header"], ["A"], ["B"], ["C"] ], { operator: "contains", value: "B" });
        filterMenu = new kendo.spreadsheet.FilterMenu(element, { range: filterMenuRange });
        var values = controller.values(filterMenuRange.resize({ top: 1 }), 0);

        equal(values[0].checked, false);
        equal(values[1].checked, true);
        equal(values[2].checked, false);
    });

    test("values that does not match existing value filter rules appear as unchecked", function() {
        var filterMenuRange = rangeWithValuesFilter("A1:A4", [ ["header"], ["A"], ["B"], ["C"] ], ["A", "B"] );
        filterMenu = new kendo.spreadsheet.FilterMenu(element, { range: filterMenuRange });
        var values = controller.values(filterMenuRange.resize({ top: 1 }), 0);

        equal(values[0].checked, true);
        equal(values[1].checked, true);
        equal(values[2].checked, false);
    });

    module("filter menu: filter by condition", {
        setup: function() {
            sheet = new kendo.spreadsheet.Sheet(3, 3, defaults.rowHeight, defaults.columnWidth);
        },
        teardown: function() {
            if (filterMenu) {
                filterMenu.destroy();
            }
        }
    });

    test("creates DropDownList with operators", function() {
        filterMenu = createWithValues([ ["A1"], ["A2"], ["A3"] ]);
        ok(filterMenu.element.find(".k-dropdown").length);
    });

    module("filter menu actions", {
        setup: function() {
            sheet = new kendo.spreadsheet.Sheet(3, 3, defaults.rowHeight, defaults.columnWidth);
        },
        teardown: function() {
            if (filterMenu) {
                filterMenu.destroy();
                filterMenu = null;
            }
        }
    });

    test("clicking sort items sorts the range", function() {
        filterMenu = createWithValues([ ["A1"], ["A2"], ["A3"] ]);

        filterMenu.bind("action", function(e) {
            equal(e.command, "SortCommand");
            equal(e.options.column, 0);
            ok(!e.options.sheet);
            ok(e.options.operatingRange instanceof kendo.spreadsheet.Range);
        });

        filterMenu.menu.trigger("select", {
            item: filterMenu.menu.element.find(".k-item[data-dir=asc]")
        });
    });

    test("does not trigger sort on a NullRef", 0, function() {
        filterMenu = createWithValues([ ["A1"] ], "A1");

        filterMenu.bind("action", function() {
            ok(false);
        });

        filterMenu.menu.trigger("select", {
            item: filterMenu.menu.element.find(".k-item[data-dir=asc]")
        });
    });

    function indludesValue(range, value) {
        var values = range.values();
        values = [].concat.apply([], values);
        return values.indexOf(value) >= 0;
    }

    test("clicking sort items sorts all columns, sans header", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        filterMenu.bind("action", function(e) {
            var range = e.options.operatingRange;
            ok(!indludesValue(range, "A1"), "header sorted");
            ok(!indludesValue(range, "B1"), "header sorted");
            ok(indludesValue(range, "A2"));
            ok(indludesValue(range, "B3"));
        });

        filterMenu.menu.trigger("select", {
            item: filterMenu.menu.element.find(".k-item[data-dir=asc]")
        });
    });

    test("apply of filtered items triggers ApplyFilterCommand on complete range", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        filterMenu.bind("action", function(e) {
            equal(e.command, "ApplyFilterCommand");
            ok(e.options.valueFilter.values.length, 1);
            ok(e.options.valueFilter.values[0], "A1");
            var range = e.options.operatingRange;
            ok(range instanceof kendo.spreadsheet.Range);
            ok(indludesValue(range, "A1"));
            ok(indludesValue(range, "B2"));
        });

        var tree = filterMenu.valuesTreeView;

        tree.element.find(".k-in").each(function() {
            var dataItem = tree.dataItem(this);

            dataItem.set("checked", dataItem.text == "A2");
        });

        filterMenu.apply();
    });

    test("clear of filtered items triggers ClearFilterCommand on complete range", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        filterMenu.bind("action", function(e) {
            equal(e.command, "ClearFilterCommand");
        });

        filterMenu.clear();
    });

    test("gets the active container", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        ok(filterMenu.viewModel.active, "value");
    });

    test("gets existing filters (string filter)", function() {
        sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "contains", value: "foo" }
                ]
            })
        });

        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        var criteria = filterMenu.viewModel.customFilter.criteria;

        equal(criteria[0].operator, "contains");
        equal(criteria[0].value, "foo");
    });

    test("gets the filter type (string filter)", function() {
        var range = sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "contains", value: "foo" }
                ]
            })
        });

        var filterType = controller.filterType(range, 0);

        equal(filterType, "string");
    });

    test("gets existing filters (number filter)", function() {
        sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "eq", value: 11 }
                ]
            })
        });

        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        var criteria = filterMenu.viewModel.customFilter.criteria;

        equal(criteria[0].operator, "eq");
        equal(criteria[0].value, 11);
    });

    test("gets the filter type (number filter)", function() {
        var range = sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "eq", value: 11 }
                ]
            })
        });

        var type = controller.filterType(range, 0);

        equal(type, "number");
    });

    test("gets existing filters (date filter)", function() {
        sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "eq", value: new Date()}
                ]
            })
        });

        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"], ["A3", "B3"] ], "A1:B3");

        var criteria = filterMenu.viewModel.customFilter.criteria;

        equal(criteria[0].operator, "eq");
        ok(criteria[0].value instanceof Date);
    });

    test("gets the filter type (date filter)", function() {
        var range = sheet.range("A1:B3").filter({
            column: 0,
            filter: new kendo.spreadsheet.CustomFilter({
                logic: "and",
                criteria: [
                    { operator: "eq", value: new Date()}
                ]
            })
        });

        var filterType = controller.filterType(range, 0);

        equal(filterType, "date");
    });

    test("apply triggers command on passed column", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"] ]);

        filterMenu.bind("action", function(e) {
            equal(e.options.column, 1);
        });

        filterMenu.options.column = 1;

        filterMenu.apply();
    });

    test("clear triggers command on passed column", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"] ]);

        filterMenu.bind("action", function(e) {
            equal(e.options.column, 1);
        });

        filterMenu.options.column = 1;

        filterMenu.clear();
    });

    test("changes input widget based on operator type", function() {
        filterMenu = createWithValues([ ["A1", "B1"], ["A2", "B2"] ]);

        var conditionFilterContainer = filterMenu.element.find(".k-spreadsheet-condition-filter");
        var dropdown = conditionFilterContainer.find("[data-role='dropdownlist']").data("kendoDropDownList");
        var viewModel = filterMenu.viewModel;

        ok(viewModel.isNone(), 1);

        dropdown.select(1);//string_contains
        dropdown.trigger("change");
        ok(viewModel.isString(), 2);
        ok(!viewModel.isNumber(), 3);
        ok(!viewModel.isDate(), 4);

        dropdown.select(5);//date_eq
        dropdown.trigger("change");
        ok(!viewModel.isString(), 5);
        ok(!viewModel.isNumber(), 6);
        ok(viewModel.isDate(), 7);

        dropdown.select(9);//number_eq
        dropdown.trigger("change");
        ok(!viewModel.isString(), 8);
        ok(viewModel.isNumber(), 9);
        ok(!viewModel.isDate(), 0);
    });

    var viewModel;

    module("FilterMenuViewModel", {
        setup: function() {
            viewModel = new kendo.spreadsheet.FilterMenuViewModel({ });
        }
    });

    function valuesDataSource(data) {
        var dataSource = new kendo.data.HierarchicalDataSource({
            data: [ { text: "All", items: data } ]
        });

        dataSource.read();
        dataSource.data()[0].load();

        return dataSource;
    }

    test("values are updated upon checkbox check", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "1", value: "1", dataType: "string", checked: true },
            { text: "2", value: "2", dataType: "string", checked: false }
        ]);

        viewModel.valuesChange();

        var values = viewModel.valueFilter.values;

        equal(values.length, 1);
        strictEqual(values[0], "1");
    });

    test("cell value is passed to the value filter", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { value: 0.01, format: "0%", dataType: "string", checked: true },
            { value: 0.02, format: "0%", dataType: "string", checked: false }
        ]);

        viewModel.valuesChange();

        var values = viewModel.valueFilter.values;

        equal(values.length, 1);
        strictEqual(values[0], 0.01);
    });

    test("blanks field is added to the value filter options", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { dataType: "blank", checked: false },
            { value: 0.01, format: "0%", dataType: "string", checked: true },
            { value: 0.02, format: "0%", dataType: "string", checked: false }
        ]);

        viewModel.valuesChange();

        var blanks = viewModel.valueFilter.blanks;
        equal(blanks, false);
    });

    test("dates are converted back to numbers", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { value: new Date("6/30/2014"), dataType: "date", checked: true },
            { value: new Date("8/22/2014"), dataType: "date", checked: false }
        ]);

        viewModel.valuesChange();

        var values = viewModel.valueFilter.values;
        equal(values[0], kendo.spreadsheet.dateToNumber(new Date("6/30/2014")));
    });

    test("search in string values", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "aaa", dataType: "string" },
            { text: "bbb", dataType: "string" },
            { text: "aaa", dataType: "string" }
        ]);

        viewModel.filterValues("bb");

        var values = viewModel.valuesDataSource.data()[0].items;

        equal(values[0].hidden, true);
        equal(values[1].hidden, false);
    });

    test("search in number values", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "1" },
            { text: "2" },
            { text: "1" }
        ]);

        viewModel.filterValues("2");

        var values = viewModel.valuesDataSource.data()[0].items;

        equal(values[0].hidden, true);
        equal(values[1].hidden, false);
    });

    test("search in date values", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" },
            { text: "28 Aug", value: new Date("8/28/2014"), dataType: "date" },
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" }
        ]);

        viewModel.filterValues("aug");

        var values = viewModel.valuesDataSource.data()[0].items;

        equal(values[0].hidden, true);
        equal(values[1].hidden, false);
    });

    test("automatically selects values that match the search criteria", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" },
            { text: "28 Aug", value: new Date("8/28/2014"), dataType: "date" },
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" }
        ]);

        viewModel.filterValues("aug");

        var values = viewModel.valuesDataSource.data()[0].items;

        equal(values[0].checked, false);
        equal(values[1].checked, true);
    });

    test("displays appendToSearch checkbox", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" },
            { text: "28 Aug", value: new Date("8/28/2014"), dataType: "date" },
            { text: "30 Jun", value: new Date("6/30/2014"), dataType: "date" }
        ]);

        viewModel.filterValues("aug");
        ok(viewModel.hasActiveSearch);

        viewModel.filterValues("");
        ok(!viewModel.hasActiveSearch);
    });

    test("does not merge search result if appendToSearch: false", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "aaa", value: "aaa" },
            { text: "bbb", value: "bbb" },
            { text: "ccc", value: "ccc" }
        ]);

        viewModel.filterValues("bb");
        viewModel.valuesChange();

        viewModel.set("appendToSearch", false);

        viewModel.filterValues("aa");
        viewModel.valuesChange();

        var valueFilter = viewModel.valueFilter;

        equal(valueFilter.values.length, 1);
        equal(valueFilter.values[0], "aaa");
    });

    test("merges search result if appendToSearch: true", function() {
        viewModel.valuesDataSource = valuesDataSource([
            { text: "aaa", value: "aaa" },
            { text: "bbb", value: "bbb" },
            { text: "ccc", value: "ccc" }
        ]);

        viewModel.filterValues("bb");
        viewModel.valuesChange();

        viewModel.set("appendToSearch", true);

        viewModel.filterValues("aa");
        viewModel.valuesChange();

        var valueFilter = viewModel.valueFilter;

        equal(valueFilter.values.length, 2);
        equal(valueFilter.values[0], "aaa");
        equal(valueFilter.values[1], "bbb");
    });

})();
