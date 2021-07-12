import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Modal extends LightningElement {
  showModal = false;
  saveAndNew = false;
  cssLoaded = false;
  showErrorButton=false;
  showErrorPopover=false;
  messages = [];
  @api recordId;
  @api owner

  renderedCallback(){
    if(this.template.querySelector('ul')){
      this.template.querySelector('ul').innerHTML = "";
      this.messages.forEach(error=>{
        let li = document.createElement('li');
        li.innerHTML = error;
        li.setAttribute('style','list-style-type: disc;')
        this.template.querySelector('ul').appendChild(li);
      })
    }
  }

  handleSuccess (event){
    const payload = event.detail.fields;
    let message = "Contact \"";
    if(payload.Salutation.value){
      message += payload.Salutation.value + " ";
    }
    if(payload.FirstName.value){
      message += payload.FirstName.value + " ";
    }
    if(payload.LastName.value){
      message += payload.LastName.value + "\" was created";
    }
       
    this.showErrorButton=false;
    this.showErrorPopover=false;
    this.dispatchEvent(new ShowToastEvent({
      message: message,
      variant: "success",
    }));

    if(!this.saveAndNew){
      this.showModal = false;
    }
    else{
      this.saveAndNew = false;
      const inputFields = this.template.querySelectorAll('lightning-input-field');
      if (inputFields) {
        inputFields.forEach(field => { field.reset();});
      }
    }
  }

  handleError(event)
  {
    this.showErrorButton=true;
    this.showErrorPopover=true;
    this.messages = [];

    if(event.detail.output.errors.length > 0){
      this.getErrorMessagesFromArray(event.detail.output.errors);
    }
    if(event.detail.output.fieldErrors.Name){
      this.getErrorMessagesFromArray(event.detail.output.fieldErrors.Name);
    }
    if(event.detail.output.fieldErrors.Email){
      this.getErrorMessagesFromArray(event.detail.output.fieldErrors.Email);
    }
    this.renderedCallback();   
  }
  
  @api show() {
    this.showModal = true;
  }

  handleDialogClose() {
    this.showModal = false;
    this.showErrorButton=false;
    this.showErrorPopover=false;
  }

  handleSaveAndNewButtonClick(){
    this.saveAndNew = true;
    this.template.querySelector('lightning-record-edit-form').submit();
  }

  handleSaveButtonClick(){
    this.saveAndNew = false; 
    this.template.querySelector('lightning-record-edit-form').submit();
  }
  
  visibilityErrorDialog(){
    if(this.showErrorPopover){
      this.showErrorPopover = false;
    }
    else{
      this.showErrorPopover = true;
    }
  }

  getErrorMessagesFromArray(array){
    array.forEach(error => {
      this.messages.push(error.message);
    })
  }
}