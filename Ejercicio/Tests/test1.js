const { t, Selector, ClientFunction, userVariables } = require("testcafe");
import addDevicePage from '../Pages/addDevicePage';
import devicesPAge from '../Pages/devicesPAge';
import devices from '../Pages/devices';
import { faker } from '@faker-js/faker';

fixture('Ejercicio_TestCafe');

let response;

test('test 1', async t => {
    
    //Make an API call to retrieve the list of devices
    response = await t.request({
        url: userVariables.urlDevicesList,
        method: 'GET'
    });

    //Use the list of devices to check the elements are visible in the DOM. Check the name, 
    //type and capacity of each element of the list using the class names and make sure they are correctly displayed
    
    let list = response.body;

    for(let i=0; i<list.length; i++){
        const {system_nameSelector, system_typeSelector, system_capacitySelector} = 
        await devicesPAge.findingElementText(list[i].system_name, list[i].type, list[i].hdd_capacity);
        await t.expect(system_nameSelector.visible).ok();
        await t.expect(system_typeSelector.visible).ok();
        await t.expect(system_capacitySelector.visible).ok();


        //Verify that all devices contain the edit and delete buttons.
        await t.expect(devicesPAge.edit_button().visible).ok();
        await t.expect(devicesPAge.remove_button().visible).ok();
    };
});

test('test 2', async t => {

    function randomData(array){
        return array[Math.floor(Math.random()*array.length)]
    }
    
    //Verify that devices can be created properly using the UI.
    devicesPAge.clickOnAddDevice();

    const name = `DEVICE-${faker.name.firstName()}`;
    addDevicePage.setName(name);

    addDevicePage.setType();

    const randomHdd = ['128', '240', '500','1000'];
    addDevicePage.setHdd(randomData(randomHdd));

    addDevicePage.clickOnSaveBtn();

    //Verify the new device is now visible. Check name, type and capacity are visible and correctly displayed to the user.
    response = await t.request({
        url: userVariables.urlDevicesList,
        method: 'GET'
    });

    let list = response.body;
    for(let i=0; i<list.length; i++){
        const {system_nameSelector, system_typeSelector, system_capacitySelector} = 
        await devicesPAge.findingElementText(list[i].system_name, list[i].type, list[i].hdd_capacity);
        await t.expect(system_nameSelector.visible).ok();
        await t.expect(system_typeSelector.visible).ok();
        await t.expect(system_capacitySelector.visible).ok();
    };
});

test('test 3', async t =>{

    response = await t.request({
        url: userVariables.urlDevicesList,
        method: 'GET'
    });
    
    //Make an API call that renames the first device of the list to “Rename Device”.
    let name = (await devices.deviceData()).system_name;
    let type = (await devices.deviceData()).type;
    let hdd = (await devices.deviceData()).hdd_capacity;

    await t.request({
        url: `${userVariables.urlDeviceID}${response.body[0].id}`,
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: {
            "system_name": name, //"DESKTOP-SMART"
            "type": type,
            "hdd_capacity": hdd
          }
    });

    let getDevice = await t.request({
        url: `${userVariables.urlDeviceID}${response.body[0].id}`,
        method: 'GET'
    });

    //Reload the page and verify the modified device has the new name.
    await t.eval(() => location.reload(true));
});

test('test 4', async t => {

    response = await t.request({
        url: userVariables.urlDevicesList,
        method: 'GET'
    });
    
    let responseReverse = response.body.reverse(); 

    //Make an API call that deletes the last element of the list.
    await t.request({
        url: `${userVariables.urlDeviceID}${response.body[0].id}`,
        method: 'DELETE'
    });

    //Reload the page and verify the element is no longer visible and it doesn’t exist in the DOM.
    await t.eval(() => location.reload(true));
});
