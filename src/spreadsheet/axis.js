(function(f, define){
    define([ "../kendo.core" ], f);
})(function(){

(function(kendo) {
    function Axis(count, value, fixed) {
        this.values = new kendo.spreadsheet.RangeList(0, count - 1, value, true);
        this.scrollBarSize = kendo.support.scrollbar();
        this.fixed = fixed;
        this._refresh();
    }

    Axis.prototype.value = function(start, end, value) {
        if (value !== undefined) {
            this.values.value(start, end, value);
            this._refresh();
        } else {
            return this.values.iterator(start, end).at(0);
        }
    };

    Axis.prototype.visible = function(start, end) {
        var startSegment = null;
        var endSegment = null;
        var lastPage = false;

        if (end >= this.total + this.scrollBarSize) {
            lastPage = true;
        }

        var ranges = this.pixelValues.intersecting(start, end);

        startSegment = ranges[0];
        endSegment = ranges[ranges.length - 1];

        var startOffset = start - startSegment.start;

        var startIndex = ((startOffset / startSegment.value.value) >> 0) + startSegment.value.start;

        var offset = startOffset - (startIndex - startSegment.value.start) * startSegment.value.value;

        var endOffset = end - endSegment.start;
        var endIndex = ((endOffset / endSegment.value.value) >> 0) + endSegment.value.start;

        if (endIndex > endSegment.value.end) {
            endIndex = endSegment.value.end;
        }

        if (lastPage) {
            offset += endSegment.value.value - (endOffset - (endIndex - endSegment.value.start) * endSegment.value.value);
        }

        offset = -offset;

        if (!this.fixed) {
            offset += start;
        }

        return {
            values: this.values.iterator(startIndex, endIndex),
            offset: offset,
            start: startIndex,
            end: endIndex
        };
    };

    Axis.prototype._refresh = function() {
        var current = 0;
        this.pixelValues = this.values.map(function(range) {
            var start = current;
            current += (range.end - range.start + 1) * range.value;
            var end = current - 1;
            return new kendo.spreadsheet.ValueRange(start, end, range);
        });

        this.total = current;
    };

    kendo.spreadsheet.Axis = Axis;
})(kendo);
}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });
