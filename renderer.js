


const btnOpen = document.getElementById("btn-open");

const btnClose = document.getElementById("btn-close");

const inputURLEle = document.getElementById("name-url");

const jsonEles = document.getElementById("json-names");




btnOpen.onclick = () => {

    const ipcRenderer = window.electron.ipcRenderer;
    const jsonElesVal = jsonEles.value;
    let urlVal = inputURLEle.value;

    if(urlVal.trim() === '') {
        alert('url is empty!!!')
        return;
    }

    const jsonVals = JSON.parse(jsonElesVal);

    const jsonEntities = jsonVals.entities;

    if(jsonEntities.length > 0) {
        for(let i = 0; i < jsonEntities.length; i++) {
            const jsonEntity = jsonEntities[i];
            const memberName = `easemob-demo%23chatdemoui_${jsonEntity.imUsername}`;
    
            console.log('memberName:', memberName);

            let realUrl = `${urlVal}&name=${memberName}`;

            // ipcRenderer.send("open-exteral-url", "https://rtc-turn4-hsb.easemob.com/emedia/demo0/?rest=https://a1-mp-dev.easemob.com&type=10&password=123");

            ipcRenderer.send("open-exteral-url", realUrl, jsonEntity.realName || jsonEntity.username || '');
        }
    }

    console.log('url:', urlVal);
}

btnClose.onclick = () => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send("close-all-exteral-window");
}