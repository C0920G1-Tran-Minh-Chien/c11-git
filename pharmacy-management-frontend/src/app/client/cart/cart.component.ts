import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CartService} from '../../service/cart.service';
import {Currency} from '../../model/cart/currency';
import {DrugCart} from "../../model/cart/drug-cart";

const CART_KEY = 'drug-cart-id';
const USER_KEY = 'auth-user';
//#region USD100 >> 100 USD
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Voucher} from "../../model/cart/voucher";

registerLocaleData(localeFr, 'fr');

// #endregion

declare let paypal: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  //#region DATA TEST 1

  // #endregion

  //#region CART
  drugCart!: DrugCart;
  drugCartListShow: DrugCart[] = [];
  moneyTotal = 0;
  moneyPayPal = 0;
  medicineTotal = 0;
  currency!: Currency;
  currencyDateNow = '';
  currencyMoney = 0;
  resultMsg = '';
  deleteId: number;
  deleteInfo = '';
  moneyPayVN = 0;
  // #endregion

  //#region PAYPAL
  finalAccount = 1;
  paypalLoad = true;

  addScript = false;
  paypalConfig = {
    env: 'sandbox',
    client: {
      sandbox: 'AbnnpqkZWFt3p_vsAq9MTYGktX4-6iq1LQVNQlSCVSFPxZ-wNFmL65aE0JGqu4E8a1nzUDX8XkP2amk6',
      production: ''
    },
    style: {
      label: 'pay',   // paypal | checkout | pay
      size: 'responsive',    // small | medium | large | responsive
      shape: 'pill',     // pill | rect
      color: 'gold',      // gold | blue | silver | black
      tagline: 'true'
    },
    commit: true,
    payment: (data, actions) => {
      return actions.payment.create({
        payment: {
          transactions: [
            // {amount: {total: this.moneyPayPal, currency: 'USD'}}
            {amount: {total: 1, currency: 'USD'}}
          ]
        }
      });
    },
    onAuthorize: (data, actions) => {
      return actions.payment.execute().then((payment) => {
        // Do something when payment is successful.
        this.voucherMoney = 0;
        this.resultMsg = 'Thanh toán thành công';

        localStorage.removeItem(CART_KEY);
        this.showMessageSuccess();
        // Xóa Voucher
        this.cartService.removeVoucher(this.voucherListIdUsed.toString()).subscribe(success => {
          console.log("ok");
        }, error => {
          console.log("error");
        });
        // Send email.
        let list = [];
        console.log(this.drugCartListShow);
        this.drugCartListShow.forEach(e => {
          list.push(e.drugId, e.count)
        });
        console.log(list.toString());
        this.cartService.sendEmail(this.user.accountName, this.user.email, list.toString()).subscribe(e => {
          console.log('ok');
        }, error => {
          console.log('error');
        });
        this.drugCartListShow = [];
      });
    }
  };

//   #endregion

  //#region VOUCHER
  voucherList: Voucher[] = [];
  voucherMsg = '';
  isVoucher = false;
  voucherForm = this.fb.group({
    code: ['', [Validators.maxLength(10)]]
  });
  voucherListIdUsed: number[] = [];
  voucherMoney = 0;

  // #endregion

  //#region EMAIL
  user = {
    accountName: '',
    email: '',
  };

  //#endregion
  constructor(private cartService: CartService,
              private fb: FormBuilder,
              private toastrService: ToastrService,
              private http: HttpClient,
              private cdref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.getDrugCartList();
    // localStorage.setItem(USER_KEY, JSON.stringify(this.account));
    this.getAccount();
    this.getVoucherList();
  }

  getVoucherList() {
    this.cartService.findAllVoucher().subscribe(data => {
      this.voucherList = data;
    })
  }

  getAccount() {
    this.user = JSON.parse(localStorage.getItem(USER_KEY));
  }

  getDrugCartList() {
    this.resultMsg = '';
    let data = JSON.parse(localStorage.getItem(CART_KEY));
    if (data == null) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      let count = data[i].count;
      this.cartService.findDrugCartById(data[i].drugId).subscribe(drug => {
        this.drugCart = {
          drugId: drug.drugId,
          drugName: drug.drugName,
          wholesalePrice: drug.wholesalePrice,
          drugAmount: drug.drugAmount,
          drugImageDetails: drug.drugImageDetails,
          count: data[i].count,
          price: drug.wholesalePrice * data[i].count,
        };
        this.drugCartListShow.push(this.drugCart);
      });
    }
  }


  //#region ADD + SUB + DEL + UPDATE
  sendDeleteId(i: number, info: string) {
    this.deleteId = i;
    this.deleteInfo = info;
  }

  medicineSub(i: number) {
    if (this.drugCartListShow[i].count > 0) {
      this.drugCartListShow[i].count--;
    }
    this.drugCartListShow[i].price = this.drugCartListShow[i].wholesalePrice * this.drugCartListShow[i].count;
    localStorage.setItem(CART_KEY, JSON.stringify(this.drugCart));
  }

  medicineAdd(i: number) {
    if (this.drugCartListShow[i].count >= this.drugCartListShow[i].drugAmount) {
      this.showMessageOutOfDrug();
      return;
    }
    this.drugCartListShow[i].count++;
    this.drugCartListShow[i].price = this.drugCartListShow[i].wholesalePrice * this.drugCartListShow[i].count;
    localStorage.setItem(CART_KEY, JSON.stringify(this.drugCartListShow));
  }

  delMedicine(i) {
    this.drugCartListShow.splice(i, 1);
    localStorage.setItem(CART_KEY, JSON.stringify(this.drugCartListShow));
  }

  getTotal() {
    for (let i = 0; i < this.drugCartListShow.length; i++) {
      this.moneyTotal += this.drugCartListShow[i].price;
      this.medicineTotal += this.drugCartListShow[i].count;
      if (this.drugCartListShow[i].count === 0) {
        this.delMedicine(i);
      }
    }
    this.moneyPayVN = this.moneyTotal + 30000 - this.voucherMoney;
    if (this.moneyPayVN < 0) {
      this.moneyPayVN = 0;
    }
    this.convertUsdCurrency(this.moneyPayVN);
  }

  update() {
    this.medicineTotal = 0;
    this.moneyTotal = 0;
    this.moneyPayPal = 0;
    this.getTotal();
    localStorage.setItem(CART_KEY, JSON.stringify(this.drugCartListShow));
    if (!this.moneyTotal) {
      this.showMessageNotFound();
    }
    this.getPaypPal();
  }

  // #endregion

  //#region CONVERT MONEY get MONEY + Date now currency + Currency
  convertUsdCurrency(VND: number) {
    this.cartService.convertUsdCurrency().subscribe(data => {
      this.currency = data;
      const vnd = this.currency.rates['VND'];
      const usd = this.currency.rates['USD'];
      this.currencyDateNow = this.currency.date;
      this.currencyMoney = vnd / usd;
      this.moneyPayPal = usd * VND / vnd;
    }, (error: HttpErrorResponse) => {
      console.log(error.error);
    });
  }

  // #endregion

  //#region Paypal
  getPaypPal(): void {
    if (!this.addScript && this.medicineTotal) {
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#myPaypalButton');
        this.paypalLoad = false;
      });
    }
  }

  private addPaypalScript() {
    this.addScript = true;
    return new Promise((resolve, rejects) => {
      const scriptTagElement = document.createElement('script');
      scriptTagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    });
  }

  // #endregion

  //#region Voucher
  checkVoucher() {
    this.isVoucher = false;
    if(!this.voucherList){
      this.voucherList = [];
    }
    for (let i = 0; i < this.voucherList.length; i++) {
      if (this.voucherList[i].code == this.voucherForm.value.code) {
        for (let j = 0; j < this.voucherList.length; j++) {
          if (this.voucherListIdUsed[j] == this.voucherList[i].id) {
            this.voucherMsg = 'Mã phiếu đã nhập';
            return;
          }
        }
        this.voucherMoney += parseInt(this.voucherList[i].money);
        this.voucherMsg = 'Mã trị giá: ' +
          // Thêm , cho số
          this.voucherList[i].money.toString().split('').reverse().reduce((prev, next, index) => {
            return ((index % 3) ? next : (next + ',')) + prev;
          });
        this.voucherListIdUsed.push(this.voucherList[i].id);
        this.update();
        this.isVoucher = true;
        return;
      }
    }
    this.voucherMsg = 'Mã phiếu ưu đãi không tồn tại';
  }

  removeVoucherUsed(voucherIndexUse: number[]) {

  }

  // #endregion

  showMessageNotFound() {
    this.toastrService.error('Bạn chưa có sản phẩm trong giỏ hàng', 'Thông báo', {
      timeOut: 3000,
      progressBar: true,
    });
  }

  showMessageOutOfDrug() {
    this.toastrService.error('Thuốc đã hết hàng', 'Thông báo', {
      timeOut: 3000,
      progressBar: true,
    });
  }

  showMessageSuccess() {
    this.toastrService.success('Thanh toán thành công', 'Thông báo', {
      timeOut: 3000,
      progressBar: true,
    });
  }
}
