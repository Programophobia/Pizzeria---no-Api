import {settings, select, templates, classNames} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      this.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {
        wrapper: element,
        toogleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
        deliveryFee: element.querySelector(select.cart.deliveryFee),
        totalNumber: element.querySelector(select.cart.totalNumber),
        subtotalPrice: element.querySelector(select.cart.subtotalPrice),
        totalPrice: element.querySelector(select.cart.totalPrice),
        total: element.querySelector(select.cart.totalP),
        form: element.querySelector(select.cart.form),
        address: element.querySelector(select.cart.address),
        phone: element.querySelector(select.cart.phone),
      };
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });

      thisCart.dom.toogleTrigger.addEventListener('click', event =>{
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive)});

        thisCart.dom.productList.addEventListener('updated', function(){
          thisCart.update();
        });

        thisCart.dom.productList.addEventListener('remove', function(event){
          thisCart.remove(event.detail.cartProduct);
        });  
    }
  
    remove(product){
      const thisCart = this;
      product.dom.wrapper.remove();
      const indexOfProduct = thisCart.products.indexOf('productToRemove');
      thisCart.products.splice(indexOfProduct,1);
      thisCart.update();
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update() {
      const thisCart = this;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;

      

      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
        thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
         if (thisCart.totalNumber !== 0){
          thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
         }
         
         else  thisCart.totalPrice = 0 
        }

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.total.innerHTML = thisCart.totalPrice;   
    }

    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      console.log(url);
      const payload = {};

      payload.address = thisCart.dom.address.value;
      payload.phone = thisCart.dom.phone.value;
      payload.totalPrice = thisCart.totalPrice;
      payload.subtotalPrice = thisCart.subtotalPrice; 
      payload.totalNumber = thisCart.totalNumber;
      payload.deliveryFee = thisCart.deliveryFee;
      payload.products = [];

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }
}

export default Cart