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

     console.log('new Project:', thisProduct);
    }


    renderInMenu(){
      const thisProduct = this;
      //generate html based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      console.log(generatedHTML);
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
    console.log(thisProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    console.log(this.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);//dom
    console.log(thisProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);//dom
    console.log(this.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);//dom
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);//dom
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
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
//for(let active of activeProduct){
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
       console.log('formData', formData);
       console.log(thisProduct.processOrder);
 
        // set price to default price
       let price = thisProduct.data.price;
     
       // for every category (param)...
       for(let paramId in thisProduct.data.params) {
         // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
         const param = thisProduct.data.params[paramId];
         console.log(paramId, param);
 
       // for every option in this category
       for(let optionId in param.options) {
         // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
         const option = param.options[optionId];
         console.log(optionId, option);
 
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
      console.log(paramId, param);

      params[paramId] = {
        label: param.label,
        options: {}
      }

    // for every option in this category
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

   console.log('AmountWidget:', thisWidget);
   console.log('constructor arguments:', element);
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


      /* TODO : Add validation */

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

      const event = new Event('updated');
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
      };


    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toogleTrigger.addEventListener('click', event =>{
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    }
  }
  
  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
      element = menuProduct.element;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name; 
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;   
      
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
     console.log('cart product:', thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = document.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = document.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = document.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = document.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        });
    }
  }

  const app = {
      initData: function(){
        const thisApp = this;
        thisApp.data = dataSource;
      },
      initMenu(){
        const thisApp = this;
        for (let productData in thisApp.data.products) {
          new Product(productData, thisApp.data.products[productData]);
        }
      },

      initCart: function(){
        const thisApp = this;

        const cartElem = document.querySelector(select.containerOf.cart);
        thisApp.cart = new Cart(cartElem);
      },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    }
  };


  app.init();
}