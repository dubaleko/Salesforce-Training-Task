public with sharing class ContactController {
    @AuraEnabled
    public static Map<String, String> getContacts(Id accountId){
        Map<String, String> filedsAndRecords = new Map<String, String>();
        List<Schema.FieldSetMember> fsLstMembers =  Schema.SObjectType.Contact.fieldSets.getMap().get('CustomContactsTable').getFields();

        String query = 'SELECT ';
        for (Schema.FieldSetMember member : fsLstMembers) {
            query += member.getFieldPath() + ', ';
        }
        query += 'Id From Contact Where AccountId =\''+ accountId+'\' limit 6';

        filedsAndRecords.put('FIELD_LIST', JSON.serialize(fsLstMembers));
        filedsAndRecords.put('RECORD_LiST', JSON.serialize(Database.query(query)));
        return filedsAndRecords;
    }

    @AuraEnabled
    public static Integer getContactsSize(Id accountId){
        List<Contact> contacts = [SELECT Id FROM Contact Where AccountId =: accountId];
        return contacts.size();
    }

    @AuraEnabled
    public static User getOwnerInformation(){
        User user = [Select Name, u.SmallPhotoUrl From User u where u.id=:Userinfo.getUserid()];
        return User;
    }
}