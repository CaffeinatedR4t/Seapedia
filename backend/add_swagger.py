import os
import re

handlers_dir = r"C:\Users\Jeremy yosep pohar\Downloads\seapedia\backend\internal\handlers"

routes = {
    "Register": "/auth/register [post]",
    "Login": "/auth/login [post]",
    "Me": "/auth/me [get]",
    "SelectRole": "/auth/select-role [post]",
    "ListProducts": "/products [get]",
    "GetProduct": "/products/{id} [get]",
    "ListMyProducts": "/seller/products [get]",
    "CreateProduct": "/seller/products [post]",
    "UpdateProduct": "/seller/products/{id} [put]",
    "DeleteProduct": "/seller/products/{id} [delete]",
    "Checkout": "/buyer/checkout [post]",
    "ListBuyerOrders": "/buyer/orders [get]",
    "GetBuyerOrder": "/buyer/orders/{id} [get]",
    "ListSellerOrders": "/seller/orders [get]",
    "UpdateSellerOrderStatus": "/seller/orders/{id}/status [put]",
    "AdminStats": "/admin/stats [get]",
    "ListPromos": "/admin/promos [get]",
    "CreatePromo": "/admin/promos [post]",
    "GetPromo": "/admin/promos/{id} [get]",
    "ListVouchers": "/admin/vouchers [get]",
    "GetVoucher": "/admin/vouchers/{id} [get]",
    "CreateVoucher": "/admin/vouchers [post]",
    "SimulateOverdue": "/admin/simulate-overdue [post]",
    "BuyerSpendingReport": "/buyer/report/spending [get]",
    "SellerIncomeReport": "/seller/report/income [get]",
    "ListAvailableOrders": "/driver/orders/available [get]",
    "ListActiveOrders": "/driver/orders/active [get]",
    "JobHistory": "/driver/orders/history [get]",
    "PickupOrder": "/driver/orders/{id}/pickup [put]",
    "FinishOrder": "/driver/orders/{id}/finish [put]",
    "DriverEarnings": "/driver/earnings [get]",
    "ListAddresses": "/buyer/address [get]",
    "CreateAddress": "/buyer/address [post]",
    "UpdateAddress": "/buyer/address/{id} [put]",
    "DeleteAddress": "/buyer/address/{id} [delete]",
    "GetCart": "/buyer/cart [get]",
    "AddToCart": "/buyer/cart [post]",
    "UpdateCartItem": "/buyer/cart/{itemId} [put]",
    "DeleteCartItem": "/buyer/cart/{itemId} [delete]",
    "GetWallet": "/buyer/wallet [get]",
    "TopUpWallet": "/buyer/wallet/topup [post]",
    "ListReviews": "/reviews [get]",
    "CreateReview": "/reviews [post]",
    "GetMyStore": "/seller/store [get]",
    "CreateStore": "/seller/store [post]",
    "UpdateStore": "/seller/store [put]",
    "GetStore": "/stores/{id} [get]",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        m = re.match(r'^func\s+([A-Z][a-zA-Z0-9_]*)\s*\(\w+\s*\*gin\.Context\)\s*\{', line)
        if m:
            func_name = m.group(1)
            # Only add if it doesn't already have swagger annotations
            if i == 0 or not lines[i-1].startswith('// @Router'):
                tag_name = os.path.basename(filepath).split('.')[0]
                new_lines.append(f'// @Summary {func_name}')
                new_lines.append(f'// @Description {func_name}')
                new_lines.append(f'// @Tags {tag_name}')
                if func_name in routes:
                    new_lines.append(f'// @Router /api/v1{routes[func_name]}')
                else:
                    new_lines.append(f'// @Router /api/v1/{tag_name}/{func_name} [get]')
        new_lines.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

for filename in os.listdir(handlers_dir):
    if filename.endswith(".go"):
        process_file(os.path.join(handlers_dir, filename))
print("Done")
