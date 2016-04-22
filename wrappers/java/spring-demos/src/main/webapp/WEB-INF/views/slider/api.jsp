<%@page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@taglib prefix="kendo" uri="http://www.kendoui.com/jsp/tags"%>
<%@taglib prefix="demo" tagdir="/WEB-INF/tags"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<demo:header />

<div class="box wide">
    <div class="box-col">
        <h4>Slider API Functions</h4>
        <ul class="options">
            <li>
                <button class="k-button" id="enableSlider">Enable</button>
                <button class="k-button" id="disableSlider">Disable</button>
            </li>
            <li>
                <input type="text" id="newValue" value="1" class="k-textbox" />
                <button class="k-button" id="setSliderValue">Set value</button>
            </li>
            <li>
                <button class="k-button" id="getSliderValue">Get value</button>
            </li>
        </ul>
    </div>
    <div class="box-col">
        <h4>RangeSlider API Functions</h4>
        <ul class="options">
            <li>
                <button class="k-button" id="enableRangeSlider">Enable</button>
                <button class="k-button" id="disableRangeSlider">Disable</button>
            </li>
            <li>
                <input type="text" id="startValue" value="1" class="k-textbox" />
                <button class="k-button" id="setStartValue">Set selection start</button> &nbsp; | &nbsp;
                <input type="text" id="endValue" value="1" class="k-textbox" />
                <button class="k-button" id="setEndValue">Set selection end</button>
            </li>
            <li>
                <button class="k-button" id="getRangeSliderValue">Get value</button>
            </li>
        </ul>
    </div>
</div>

<div class="demo-section k-content">
    <ul id="fieldlist">
        <li>
            <label>Temperature</label>
            <kendo:slider name="slider" class="temperature" min="0" max="10" smallStep="1" largeStep="5">
            </kendo:slider>
        </li>
        <li>
            <label>Humidity</label>
            <kendo:rangeSlider name="rangeSlider" class="humidity" min="0" max="10" smallStep="1" largeStep="5" tickPlacement="both">
            </kendo:rangeSlider>
        </li>
    </ul>
</div>


<script>
    $(document).ready(function() {
        var slider = $("#slider").data("kendoSlider"),
            rangeSlider = $("#rangeSlider").data("kendoRangeSlider"),
            setValue = function(e) {
                if (e.type != "keypress" || kendo.keys.ENTER == e.keyCode) {
                    var value = parseInt($("#newValue").val(), 10);

                    if (isNaN(value) || value < 0 || value > 10) {
                        alert("Value must be a number between 0 and 10");
                        return;
                    }

                    slider.value(value);
                }
            },
            setStartValue = function(e) {
                if (e.type != "keypress" || kendo.keys.ENTER == e.keyCode) {
                    var startValue = parseInt($("#startValue").val(), 10);

                    if (isNaN(startValue) || startValue < 0 || startValue > 10) {
                        alert("Value must be a number between 0 and 10");
                        return;
                    }

                    var endValue = getValue()[1];
                    rangeSlider.value([startValue, endValue]);
                }
            },
            setEndValue = function(e) {
                if (e.type != "keypress" || kendo.keys.ENTER == e.keyCode) {
                    var startValue = getValue()[0];
                    var endValue = parseInt($("#endValue").val(), 10);

                    if (isNaN(endValue) || endValue < 0 || endValue > 10) {
                        alert("Value must be a number between 0 and 10");
                        return;
                    }

                    rangeSlider.values(startValue, endValue);
                }
            };

        $("#getSliderValue").click(function() {
            alert(slider.value());
        });

        $("#enableSlider").click(function() {
            slider.enable();
        });

        $("#disableSlider").click(function() {
            slider.disable();
        });

        function getValue() {
            return rangeSlider.value();
        }

        $("#setSliderValue").click(setValue);
        $("#newValue").keypress(setValue);

        $("#setStartValue").click(setStartValue);
        $("#startValue").keypress(setStartValue);

        $("#setEndValue").click(setEndValue);
        $("#endValue").keypress(setEndValue);

        $("#getRangeSliderValue").click(function() {
            alert(getValue());
        });

        $("#enableRangeSlider").click(function() {
            rangeSlider.enable();
        });

        $("#disableRangeSlider").click(function() {
            rangeSlider.disable();
        });
    });
</script>

<style>
   .options .k-textbox {
       width: 40px;
       margin-left: 0;

   }
   .k-button {
       min-width: 80px;
   }

   #fieldlist {
       margin: 0 0 -2em;
       padding: 0;
       text-align: center;
   }

   #fieldlist > li {
       list-style: none;
       padding-bottom: 2em;
   }

   #fieldlist label {
       display: block;
       padding-bottom: 1em;
       font-weight: bold;
       text-transform: uppercase;
       font-size: 12px;
       color: #444;
   }
</style>

<demo:footer />