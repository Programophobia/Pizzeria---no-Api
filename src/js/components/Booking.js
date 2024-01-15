import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import utils from '../utils.js';

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.selected = {};
    }
    
    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
          booking: [
              startDateParam,
              endDateParam,
          ],
          eventsCurrent: [
             settings.db.notRepeatParam,
             startDateParam,
             endDateParam,
          ],
          eventsRepeat:[
              settings.db.repeatParam,
              endDateParam,
          ],
        }

        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

    
        console.log(urls);
        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function(allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
                ]);
            })
            .then(function([bookings, eventsCurrent, eventsRepeat]){
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            })
    }
   
    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;
        thisBooking.booked = {};

        
        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
       
        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopData = minDate; loopData <= maxDate; loopData = utils.addDays(loopData, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopData), item.hour, item.duration, item.table);
                }
            }
        }
        thisBooking.updateDOM();
    }


    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
            console.log('lol', hourBlock);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }
        for (let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            )
            {
                table.classList.add(classNames.booking.tableBooked);
            } else{
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
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
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.floorPlan = element.querySelector('.floor-plan');
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountamountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener('updated', function(){})
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener('updated', function(){})

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.removeTables();
            thisBooking.updateDOM();
        });

        thisBooking.dom.floorPlan.addEventListener('click', function (event){
            thisBooking.initTables(event);
        })
    }

    removeTables(){
        const thisBooking = this;
     
         for (let table of thisBooking.dom.tables){
           table.classList.remove(classNames.booking.selectedTable);
         }
    }

        
    initTables(event){
        const thisBooking = this;
        const tableId= event.target.getAttribute('data-table');
        const isSelected=event.target.classList.contains(classNames.booking.selectedTable);
            if (tableId && isSelected){
                event.target.classList.remove(classNames.booking.selectedTable);
                thisBooking.selected = {};
            } else if (tableId && !isSelected){
                thisBooking.removeTables();
                event.target.classList.add(classNames.booking.selectedTable);
                thisBooking.selected = tableId;
            }
            console.log(thisBooking.selected)
    }
}

export default Booking

