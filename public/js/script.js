const UIController = (()=>{
    DOMStrings = {
        createRoomBtn: '#create_room',
        flashMessage: '#flash_message',
        flashHeader: '#flash_header',
        flashContent: '#flash_content'
    };

    const flashMessage = document.querySelector(DOMStrings.flashMessage);
    const flashHeader = document.querySelector(DOMStrings.flashHeader);
    const flashContent = document.querySelector(DOMStrings.flashContent);

    return{
        DOMStrings: DOMStrings,
        showSuccessMessage: (roomID)=>{
            flashMessage.style.display='block';
            flashMessage.style.background='#7aff42';
            flashHeader.innerText='CONGRATULATIONS!';
            flashContent.innerHTML = `<p>New Room has been created.</p><p>Room ID: ${roomID}</p><p>Please Join Room to continue</p>`;
        },
        showErrorMessage: (errorMessage)=>{
            flashMessage.style.display='block';
            flashMessage.style.background='#ff4949';
            flashHeader.innerText='OOPS!';
            flashContent.innerText = errorMessage;
        }
    };
})();

const appController = ((UICtrl)=>{
    const DOMObj = UICtrl.DOMStrings;

    const createRoomBtn = document.querySelector(DOMObj.createRoomBtn);
    const flashMessage = document.querySelector(DOMObj.flashMessage);
    const flashHeader = document.querySelector(DOMObj.flashHeader);
    const flashContent = document.querySelector(DOMObj.flashContent);

    const setUpEventListeners = ()=>{
        createRoomBtn.addEventListener('click', async ()=>{
            const data = await fetch('/room/create');
            const id = await data.text();
            UICtrl.showSuccessMessage(id);
        });
    }

    return{
        init: ()=>{
            console.log('Application Running!');
            setUpEventListeners();
            if(flashContent.innerText!==''){
                flashMessage.style.display='block';
                flashMessage.style.background="#ff4949";
                flashHeader.innerText="ERROR!";
            }
        }
    }
})(UIController);

window.onload = appController.init();