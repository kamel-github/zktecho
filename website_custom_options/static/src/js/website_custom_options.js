odoo.define('website_custom_options.website_sale', function(require) {
    'use strict';

    require('web.dom_ready');
    var core = require('web.core');
    var utils = require('web.utils');
    var _t = core._t;
    var sAnimations = require('website.content.snippets.animation');
    require('website_sale.website_sale');
    var publicWidget = require('web.public.widget');
    var variantmixin = require("sale.VariantMixin");


    if(!$('.oe_website_sale').length) {
        return $.Deferred().reject("DOM doesn't contain '.oe_website_sale'");
    }


    function price_to_str(price) {
        var l10n = _t.database.parameters;
        var precision = 2;

        if ($(".decimal_precision").length) {
            precision = parseInt($(".decimal_precision").last().data('precision'));
        }
        var formatted = _.str.sprintf('%.' + precision + 'f', price).split('.');
        formatted[0] = utils.insert_thousand_seps(formatted[0]);
        return formatted.join(l10n.decimal_point);
    }

    function calculatePrice($ul, $combinationPrice){
        var $parent = $ul.closest('.js_product');
        var $price = $parent.find(".oe_price:first .oe_currency_value");
        var $website_price = $parent.find("[itemprop='price']");
		
        if($combinationPrice === undefined){
            $combinationPrice = parseFloat($website_price.text().replace('‑','-'));
        }

        var $option_data = $ul.data("option_data");
        if(_.isString($option_data)) {
            $option_data = JSON.parse($option_data.replace(/'/g, '"'));
            $ul.data('option_data', $option_data);
        }
        var $option_value_data = $ul.data("option_value_data");
        if(_.isString($option_value_data)) {
            $option_value_data = JSON.parse($option_value_data.replace(/'/g, '"'));
            $ul.data('option_value_data', $option_value_data);
        }
        var $option_public_data = $ul.data("option_public_data");
        if(_.isString($option_public_data)) {
            $option_public_data = JSON.parse($option_public_data.replace(/'/g, '"'));
            $ul.data('option_public_data', $option_public_data);
        }
        var $option_value_public_data = $ul.data("option_value_public_data");
        if(_.isString($option_value_public_data)) {
            $option_value_public_data = JSON.parse($option_value_public_data.replace(/'/g, '"'));
            $ul.data('option_value_public_data', $option_value_public_data);
        }


        if($.isEmptyObject($option_data)) {
            return 0;
        }

        var $disableButton = false;
        var $additionalPrice = 0;
        var $additionalPublicPrice = 0;
        $parent.find("input.js_custom_option_change, textarea.js_custom_option_change").each(function () {
            var $input = $(this);
            var optionId = $input.attr('option_id');
            var isRequired = $input.attr('is_required');
            var inputData = $input.val();
            if(inputData){
                var $customOptionPrice = $option_data[optionId]
                if ($customOptionPrice){
                    $additionalPrice = $additionalPrice + parseFloat($customOptionPrice);
                }
                var $customOptionPrice = $option_public_data[optionId]
                if ($customOptionPrice){
                    $additionalPublicPrice = $additionalPublicPrice + parseFloat($customOptionPrice);
                }
            } else if(isRequired == "True"){
                $disableButton = true;
            };
        });
        $parent.find("select.js_custom_option_multiple_change").each(function () {
            var $input = $(this);
            var isRequired = $input.attr('is_required');
            var inputData = $input.val();
            var $customOptionPrice = 0.0;
            var $customOptionPublicPrice = 0.0;
            if(inputData){
                $.each($input.find(":selected"), function(){
                    var $selectedOption = $(this);
                    var $selectedOptionPrice = $option_value_data[$selectedOption.val()];
                    $customOptionPrice = $customOptionPrice + parseFloat($selectedOptionPrice);
                    var $selectedOptionPublicPrice = $option_value_public_data[$selectedOption.val()];
                    $customOptionPublicPrice = $customOptionPublicPrice + parseFloat($selectedOptionPublicPrice);
                });
                if ($customOptionPrice){
                    $additionalPrice = $additionalPrice + parseFloat($customOptionPrice);
                }
                if ($customOptionPublicPrice){
                    $additionalPublicPrice = $additionalPublicPrice + parseFloat($customOptionPublicPrice);
                }
            } else if(isRequired == "True"){
                $disableButton = true;
            };
        });
		
		$parent.find("input.js_custom_option_checkbox_change").each(function () {
            var radio_type = "radio";
			var checkbox_type = "checkbox";
            if(radio_type ==  $(this).attr("type")){
              var $input = $(this);
			  var inputData = $input.val();
              var if_checked = $input.prop("checked")
              var isRequired = $input.attr('is_required');
              if (if_checked){
                if (inputData) {
                  var $selectedOption = $(this);
                  var $customOptionPrice = $option_value_data[$selectedOption.val()]
                  if ($customOptionPrice) {
                    $additionalPrice = $additionalPrice + parseFloat($customOptionPrice);
                  }
                  var $customOptionPublicPrice = $option_value_public_data[$selectedOption.val()]
                  if ($customOptionPrice){
                      $additionalPublicPrice = $additionalPublicPrice + parseFloat($customOptionPublicPrice);
                  }
                }
              }
              else if (isRequired == "True") {
				var count = 0;
				var subdisableButton = false;
                $input.closest('ul').find('li').each(function(){
                  var $options = $(this).find('.js_custom_option_checkbox_change');
                  if (! $options.prop("checked")){
                    if ($disableButton == false && count == 0){
						subdisableButton = true;
                    }
                  }
                  else{
                    subdisableButton = false;
                    count = 1;
                  }
				})
				$disableButton = $disableButton || subdisableButton;
              };
            }
            else if (checkbox_type ==  $(this).attr("type")){
              var $input = $(this);
              var inputData = $input.val();
              var if_checked = $input.prop("checked")
              var isRequired = $input.attr('is_required');
              if (if_checked){
                if (inputData) {
                  var $selectedOption = $(this);
                  var $customOptionPrice = $option_value_data[$selectedOption.val()]
                  if ($customOptionPrice) {
                    $additionalPrice = $additionalPrice + parseFloat($customOptionPrice);
                  }
                  var $customOptionPublicPrice = $option_value_public_data[$selectedOption.val()]
                  if ($customOptionPrice){
                      $additionalPublicPrice = $additionalPublicPrice + parseFloat($customOptionPublicPrice);
                  }
                }
              }
              else if (isRequired == "True") {
				var count = 0;
				var subdisableButton = false;
                $input.closest('ul').find('li').each(function(){
                  var $options = $(this).find('.js_custom_option_checkbox_change');
                  if (! $options.prop("checked")){
                    if ($disableButton == false && count == 0){
                      subdisableButton = true;
                    }
                  }
                  else{
                    subdisableButton = false;
                    count = 1;
                  }
				})
				$disableButton = $disableButton || subdisableButton;
              };
            }
        });

		$price.html(price_to_str($combinationPrice+$additionalPrice));
		
        if ($parent.find(".product_price .oe_default_price .oe_currency_value").css('text-decoration','line-through')){
          var actual_price = parseFloat($parent.find(".product_price .oe_default_price .oe_currency_value").css('text-decoration','line-through').html())
          actual_price = actual_price + $additionalPublicPrice
          $parent.find(".product_price .oe_default_price .oe_currency_value").css('text-decoration','line-through').html(price_to_str(actual_price));
        }
        if ($disableButton) {
            $parent.find("#add_to_cart").addClass("disabled");
        } else {
            $parent.find("#add_to_cart").removeClass("disabled");
        }
    }

    if (window.location.href.indexOf('shop/cart') > -1){
      $(".td-price").find(".text-danger:not(.non_discount_option_price)").css("dispaly","none !important");
    }


    $('.oe_website_sale').each(function() {
        var oe_website_sale = this;

        $(oe_website_sale).on('change', 'input.js_custom_option_change, textarea.js_custom_option_change, select.js_custom_option_multiple_change, input.js_custom_option_checkbox_change', function (ev) {
            var $ul = $(ev.target).closest('.js_add_cart_custom_options');
            $("ul[data-attribute_exclusions]").change();
        });
    });

    publicWidget.registry.WebsiteSale.include({
        _onChangeCombination: function (ev, $parent, combination) {
			var def = this._super.apply(this, arguments);
            calculatePrice($('.js_add_cart_custom_options'), combination.price);
            return def;
		},
        _handleAdd: function ($form) {

            var self = this;
            this.$form = $form;

            var productSelector = [
                'input[type="hidden"][name="product_id"]',
                'input[type="radio"][name="product_id"]:checked'
            ];

            var productReady = this.selectOrCreateProduct(
                $form,
                parseInt($form.find(productSelector.join(', ')).first().val(), 10),
                $form.find('.product_template_id').val(),
                false
            );

            // Collect custom option data
            var wk_custom_options = {}
			var file_load_check = false
            var no_file = true

			$form.find('.js_add_cart_custom_options .custom_option').each(function (ev) {

                var wk_option = $(this)
                var input = wk_option.find('input')
                var type = input.attr('type')
                var checked_input = wk_option.find('input:checked')
                if (type) {
                  if (type == 'radio') {
                    wk_custom_options[checked_input.attr('name')] = checked_input.val()
                  }
                  else if (type == 'checkbox') {
                    input.each(function () {
                      if ($(this).is(':checked')) {
                        wk_custom_options[$(this).attr('name')] = $(this).val()
                      }
                      else {
                        delete wk_custom_options[$(this).attr('name')]
                      }
                    });
                  }
                  else if (type == 'file') {
                    var file = input.prop('files')[0];
                    if (file) {
                      no_file = false
                      new Promise((resolve, reject) => {
                          var fr = new FileReader();
                          fr.onload = () => {
                            var data = fr.result;
                            wk_custom_options[input.attr('name')] = data
                            wk_custom_options['file_name'] = file.name;
                            file_load_check = true
                            resolve(data)
                          };
                          fr.readAsDataURL(file);
                      });
                    }
                    else {
                      delete wk_custom_options[input.attr('name')]
                      file_load_check = true
                    }
                  }
                  else if (type == 'date'){
                    if (input.val()){
                      wk_custom_options[input.attr('name')] = input.val()
                    }
                  }
                  else if (type == 'datetime-local'){
                    if (input.val()){
                      wk_custom_options[input.attr('name')] = input.val()
                    }
                  }
                  else if (type == 'time'){
                    if (input.val()){
                      wk_custom_options[input.attr('name')] = input.val()
                    }
                  }
                  else {
                    wk_custom_options[input.attr('name')] = input.val()
                  }
                }
                else {
                  var textarea = wk_option.find('textarea')
                  var select = wk_option.find('select')
                  if (textarea.length != 0 && $.trim(textarea.val())) {
                    wk_custom_options[textarea.attr('name')] = textarea.val()
                  }
                  else if (select.length != 0) {
                    var selected = select.find('option:selected').val()
                    if (select[0].hasAttribute('multiple')) {
                      selected = select.find('option:selected').toArray().map(item => item.value);
                    }
                    if (selected.length != 0) {
                      wk_custom_options[select.attr('name')] = selected
                    }
                    else {
                      delete wk_custom_options[select.attr('name')]
                    }

                  }

                }
			});
			
			function productReadySuper(){
				return productReady.then(function (productId) {
                    $form.find(productSelector.join(', ')).val(productId);

                    self.rootProduct = {
                        product_id: productId,
                        quantity: parseFloat($form.find('input[name="add_qty"]').val() || 1),
                        product_custom_attribute_values: self.getCustomVariantValues($form.find('.js_product')),
                        variant_values: self.getSelectedVariantValues($form.find('.js_product')),
                        no_variant_attribute_values: self.getNoVariantAttributeValues($form.find('.js_product')),
                        no_variant_attribute_values: self.getNoVariantAttributeValues($form.find('.js_product')),
                        custom_options: JSON.stringify(wk_custom_options)
                    };
                    return self._onProductReady();
                });
			}

			return new Promise((resolve, reject) => {
				function ajax_check() {
					if (file_load_check || no_file) {
						file_load_check = false
						clearInterval(check_ajax);
						resolve(productReadySuper());
					}
				}
				var check_ajax = setInterval(ajax_check, 100);
			});

        },

    });

});
