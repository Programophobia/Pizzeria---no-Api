/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },

    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },

    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },

    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },


    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      totalP: '.cart-total-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },

    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };



  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };


  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;
      //generate html based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }
  
   getElements(){
    const thisProduct = this; 
  
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //dom
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);//dom
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);//dom
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);//dom
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);//dom
   }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event) {
        event.preventDefault();
        thisProduct.processOrder});
    }
    initAccordion() {
      const thisProduct = this;
      //find the clicable trigger (the element that should react to clicking)
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      this.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
        /* find active product (product that has active class) */
      // const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
      const activeProduct = document.querySelector(select.all.menuProductsActive)
      //if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct !== null && activeProduct !== thisProduct.element) {
    
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive); //==activeProduct.classList.remove('active')
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); //== thisProduct.element.classList.toggle('active)
      });
      }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

     processOrder() {
       const thisProduct = this;
       const formData = utils.serializeFormToObject(thisProduct.form);
 
        // set price to default price
       let price = thisProduct.data.price;
     
       // for every category (param)...
       for(let paramId in thisProduct.data.params) {
         // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
         const param = thisProduct.data.params[paramId];
 
       // for every option in this category
       for(let optionId in param.options) {
         // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
         const option = param.options[optionId];
 
         //if option is clicked, add active class/else remove
         const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
         const clickedElement = formData[paramId] && formData[paramId].includes(optionId);
     
        if (optionImage) {
          if (clickedElement) {
             optionImage.classList.add(classNames.menuProduct.imageVisible);
           }
           else {
             optionImage.classList.remove(classNames.menuProduct.imageVisible);
           }
         }
 
       //if label is clicken and default == true, return: add 0 to price
 
       if(clickedElement && (option.default == true)) {
         price == price;
       }
       //if label is clicked and default == null, add option.price to let price
       else if(clickedElement && (!option.default == true)) {
         price += option.price;
       }
 
       //if label isnt clicked and default true, reduce option.price for let price
       else if((option.default == true) && !clickedElement) {
       price = price - option.price;
       }
     }
   }

   thisProduct.priceSingle = price;
   
   // update calculated price in the HTML
   price = price * thisProduct.amountWidget.value; 
   thisProduct.priceElem.innerHTML = price;
  }

      prepareCartProduct(){
        const thisProduct = this;
        
        const productSummary = {
          id: thisProduct.id,
          name: thisProduct.data.name,
          amount: thisProduct.amountWidget.value,
          priceSingle: thisProduct.priceSingle,
          price: thisProduct.priceSingle * thisProduct.amountWidget.value,
          params: thisProduct.prepareCartProductParams(),
        };
        return productSummary;
      }

      prepareCartProductParams() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.form);
        const params = {};

        for(let paramId in thisProduct.data.params) {
          const param = thisProduct.data.params[paramId];

          params[paramId] = {
            label: param.label,
            options: {}
          }
            for(let optionId in param.options) {

              const option = param.options[optionId];
              const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

                if(optionSelected){
                  params[paramId].options[optionId] = option.label;
                }
            }
        }
        return params;
      }

      addToCart(){
        const thisProduct = this;
        app.cart.add(thisProduct.prepareCartProduct());
      }
  }

  class AmountWidget {
    constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
  
   if (thisWidget.input.value === '' || thisWidget.input.value === undefined ) {
      thisWidget.setValue(settings.amountWidget.defaultValue)
    } else {
      thisWidget.setValue(thisWidget.input.value);
    }
    thisWidget.initActions();
   }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if (thisWidget.value !== newValue && !isNaN(newValue) 
      &&  thisWidget.input.value  >= settings.amountWidget.defaultMin 
      &&  thisWidget.input.value  <= settings.amountWidget.defaultMax) {
          thisWidget.value = newValue;
      } else {
        thisWidget.value = settings.amountWidget.defaultValue;
      }

      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }
  }

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

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
      
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name; 
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;   
      
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
    });

      thisCartProduct.dom.remove.addEventListener('click',function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;
      const productInfo = {};
      productInfo.id = thisCartProduct.id;
      productInfo.amount = thisCartProduct.amount;
      productInfo.price = thisCartProduct.price;
      productInfo.priceSingle = thisCartProduct.priceSingle;
      productInfo.name = thisCartProduct.name;
      productInfo.params = thisCartProduct.params;

      return productInfo;  
    }
  }
  
    const app = {

      initData: function(){
        const thisApp = this;
        thisApp.data = {};
        const url = settings.db.url + '/' + settings.db.products;
        fetch(url) 
         .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
         console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse

        thisApp.initMenu();
        });
        console.log('thisApp.data', JSON.stringify(thisApp.data));
      },

      initMenu(){
        const thisApp = this;
        for (let productData in thisApp.data.products) {
          new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        }
      },

      initCart: function(){
        const thisApp = this;
        const cartElem = document.querySelector(select.containerOf.cart);
        thisApp.cart = new Cart(cartElem);
      },

      init: function(){
        const thisApp = this;
        thisApp.initData();
        thisApp.initCart();
      }
    };
  app.init();
}