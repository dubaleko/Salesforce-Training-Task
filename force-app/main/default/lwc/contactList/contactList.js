import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe} from 'lightning/empApi';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import getContactsSize from '@salesforce/apex/ContactController.getContactsSize';
import getOwnerInformation from '@salesforce/apex/ContactController.getOwnerInformation'

const typeAttributes  = { 
    label : {fieldName : 'Name'}, 
    target: '_blank'
};

export default class ContactList extends NavigationMixin(LightningElement) {
    @api recordId;
    size;
    contacts;
    columns;
    owner;
    CHANNEL_NAME = '/event/Refresh_Related_List__e';

    renderedCallback() {
        const style = document.createElement('style');
        style.innerText = `.slds-card__header { background-color: #f2f3f2; margin-bottom: -12px; margin-top: -16px; }`;
        this.template.querySelector('lightning-card').appendChild(style);
    }

    connectedCallback() {
        this.getRelatedRecords();
        subscribe(this.CHANNEL_NAME, -1, this.refreshList);
    }

    refreshList = ()=> {
        this.getRelatedRecords();
    }
    
    getRelatedRecords() {
        getOwnerInformation().then(result =>{
            this.owner = result;
        });
        getContacts({accountId: this.recordId}).then(result => {
            this.columns = JSON.parse(result.FIELD_LIST);
            this.columns.forEach(column=>{
                if(column.fieldPath != 'Name'){
                    column.fieldName = column.fieldPath;
                }
                else{
                    column.fieldName = 'UrlName';
                    column.type = 'url'
                    column.typeAttributes = typeAttributes;
                }
            })
            this.contacts = JSON.parse(result.RECORD_LiST);
            this.getLinksOnRelatedRecords();
        });
        getContactsSize({accountId: this.recordId}).then(result =>{
            this.size = result;
        });
    }

    getLinksOnRelatedRecords(){
        let baseUrl = 'https://'+location.host+'/lightning/r/Contact/';
        this.contacts.forEach(contact => {
            contact.UrlName = baseUrl + contact.Id + '/view';
        });
    }

    get title() {
        return 'Contacts ('+ this.size +')';
    }
    
    get hasResults() {
        return (this.size > 0);
	}

    openNewContactForm() {
        const newContact = this.template.querySelector("c-new-Contact");
        newContact.show();
    }

    navigateToNewContactPage() {
        const defaultValues = encodeDefaultFieldValues({
            AccountId: this.recordId,
        });
        
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new',
                AccountId: this.recordId
            },
            state: {
                navigationLocation: 'RELATED_LIST',
                defaultFieldValues: defaultValues
            }
        });
    }

    navigateToContactRelatedList() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Account',
                relationshipApiName: 'Contacts',
                actionName: 'view'
            },
        });
    }
}