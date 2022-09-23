# -*- coding: utf-8 -*-
##############################################################################
# Copyright (c) 2017-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
# See LICENSE file for full copyright and licensing details.
# License URL : <https://store.webkul.com/license.html/>
##############################################################################


from odoo import http
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.http import request
import logging
_logger = logging.getLogger(__name__)


class WebsiteSaleCustom(WebsiteSale):

    def _filter_custom_options(self, kw):
        custom_options = {
            k.split('-')[2]: v for k,
            v in kw.items() if "custom_options" in k}
        custom_option_checkbox = {
            k: v for k, v in kw.items() if "custom_option_checkbox" in k}
        custom_option_multiple = {
            k: v for k, v in kw.items() if "custom_option_multiple" in k}
        for optionName in custom_option_multiple.keys():
            optionId = optionName.split('-')[2]
            selectedIds = request.httprequest.form.getlist(optionName)
            custom_options.update({optionId: selectedIds})
        for optionName, valueId in custom_option_checkbox.items():
            optionId = optionName.split('-')[2]
            inputData = custom_options.get(optionId, [])
            inputData += [valueId]
            custom_options.update({optionId: inputData})
        if kw.get("file_name"):
            custom_options.update({
            "file_name":kw.get("file_name")
            })
        return custom_options

    @http.route(
        ['/shop/cart/update'],
        type='http',
        auth="public",
        methods=['GET', 'POST'],
        website=True,
        csrf=False)
    def cart_update(self, product_id, add_qty=1, set_qty=0, **kw):
        request.env.context = dict(request.env.context, custom_options=self._filter_custom_options(eval(kw['custom_options'])))
        return super(WebsiteSaleCustom, self).cart_update(product_id, add_qty, set_qty, **kw)

    @http.route()
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        if kw.get('custom_options', False):
            request.env.context = dict(request.env.context, custom_options=self._filter_custom_options(eval(kw['custom_options'])))
        return super(WebsiteSaleCustom, self).cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)