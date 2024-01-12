import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking{
    constructor(element){
      const thisBooking = this;
      thisBooking.render(element);
      thisBooking.initWidgets();
    }

    render(element){
       const thisBooking = this;
       const generatedHTML = templates.bookingWidget(element);
        thisBooking.dom = {};

        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML; 
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker=element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker=element.querySelector(select.widgets.hourPicker.wrapper);

    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountamountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){})
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){})

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    }
}

export default Booking

