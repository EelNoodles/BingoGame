import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, update, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3yiDXSFZFovIurCOpkpcBnWhjkatMGh0",
  authDomain: "nutnbingo.firebaseapp.com",
  projectId: "nutnbingo",
  storageBucket: "nutnbingo.appspot.com",
  messagingSenderId: "172701986732",
  appId: "1:172701986732:web:aec9f44274661b41be9409",
  measurementId: "G-76DZEQHLPM"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase();

function bdArrayToArray(dbArray){
    var finArr = [["", "", "", "", ""], 
                    ["", "", "", "", ""], 
                    ["", "", "", "", ""], 
                    ["", "", "", "", ""], 
                    ["", "", "", "", ""]];
    var x = dbArray.split(",");
    var y = 0;
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            finArr[i][j] = x[y];
            y++;
        }
    }
    return finArr;
}

function checkLineNumber(userArr, bingoArr) {  
    var count = 0;
    //直的五條
    for (let row = 0; row < 5; row++) {
        let tempBool = true;
        for (let col = 0; col < 5; col++) {
            if(!bingoArr.includes(userArr[row][col]))
                tempBool = false;
        }
        if(tempBool){
            count++;
        }
    }
    for (let row = 0; row < 5; row++) {
        let tempBool = true;
        for (let col = 0; col < 5; col++) {
            if(!bingoArr.includes(userArr[col][row]))
                tempBool = false;
        }
        if(tempBool){
            count++;
        }
    }
    if(bingoArr.includes(userArr[0][0]) && 
    bingoArr.includes(userArr[1][1])&&
    bingoArr.includes(userArr[2][2])&&
    bingoArr.includes(userArr[3][3])&&
    bingoArr.includes(userArr[4][4])){
        count++;
    }
    if(bingoArr.includes(userArr[0][4]) && 
    bingoArr.includes(userArr[1][3])&&
    bingoArr.includes(userArr[2][2])&&
    bingoArr.includes(userArr[3][1])&&
    bingoArr.includes(userArr[4][0])){
        count++;
    }

    return count++;
}

function createTable(dbData, bingoNum, room) {
        $("#userInfo").html("哈囉！" + dbData["account"] + "，祝你賓果啦！<br>房號：" + room);
        let bingoNumberArray = bingoNum["Array"].split(",");
        var bingoTable = document.getElementById("bingoCard");
        let bingoArray = bdArrayToArray(dbData["numberArray"]);
        $("#lineNumber").text("目前的連線數量：" + checkLineNumber(bingoArray, bingoNumberArray));
        var cardLayout = "";
        for (let row = 0; row < 5; row++) {
            var tempBlank = "";
            for (let col = 0; col < 5; col++) {
                let x = bingoArray[row][col];
                if(bingoNumberArray.includes(x)){
                    tempBlank = tempBlank + "<td><div class='insideText, bingoNum'>" + x +"</div></td>";
                }else{
                    tempBlank = tempBlank + "<td><div class='insideText'>" + x +"</div></td>";
                };
                
            }
            cardLayout = cardLayout + "<tr>" + tempBlank + "</tr>";
        }
        bingoTable.innerHTML = cardLayout;
        $("#bingoArea").css("display", "block");
        $("#loginArea").css("display", "none");

        if(dbData["owner"] == false){
            $("#addNum").css("filter", "grayscale(100%)");
        }
    }

    function generateArray() { 
        var tempArray = [];
        do{
            let x = Math.floor((Math.random() * 50) + 1);
            if(!tempArray.includes(x)){
                tempArray.push(x);
            }
        }while (tempArray.length < 25);
        return tempArray;
    }

    function createUser(roomId, userId, Owner) {
        const db = getDatabase();
        var array = generateArray().toString();
        set(ref(db, roomId +'/' + userId), {
            numberArray: array,
            account: userId,
            owner: Owner
        }).then(()=>{
            $("#statusbar").html(userId + " 註冊成功，請重新登入。");
            $("#btn_login").css("filter", "grayscale(0%)");
            pause = false;
        });
      }    

var isJoin = true;
$("#btn_join").click(function (e) { 
    isJoin = true;
    $("#btn_join").fadeOut();
    $("#btn_create").fadeOut(function() {
        $("#account").fadeIn();
        $("#code").fadeIn();
        $("#btn_login").fadeIn();
        $("#btn_login").val("加入");
        $("#btn_main").fadeIn();
    });
});

$("#btn_create").click(function (e) { 
    isJoin = false;
    $("#btn_join").fadeOut();
    $("#btn_create").fadeOut(function() {
        $("#account").fadeIn();
        $("#code").fadeIn();
        $("#btn_login").fadeIn();
        $("#btn_login").val("建立");
        $("#btn_main").fadeIn();
    });
});

$("#btn_main").click(function (e) { 
    $("#statusbar").html("");
    isJoin = false;
    $("#account").fadeOut();
    $("#btn_login").fadeOut();
    $("#btn_main").fadeOut();
    $("#code").fadeOut(function() {
        $("#btn_join").fadeIn();
        $("#btn_create").fadeIn();
    });
});

var pause = false;
$("#btn_login").click(function(){
    if(!pause){
        if(isJoin){
            $("#btn_login").css("filter", "grayscale(100%)");
            if($("#code").val() || $("#account").val()){
                $("#statusbar").html("")
                const dbRef = ref(getDatabase());
                get(child(dbRef, $("#code").val())).then((snapshot) => {
                    if(snapshot.val() != null){
                        get(child(dbRef, $("#code").val() + '/' + $("#account").val())).then((snapshotWacc) => {
                            if(snapshotWacc.val() != null){ //玩家已經存在
                                get(child(dbRef, $("#code").val() + '/BingoNumber')).then((snapshotNum) => {
                                    $("#statusbar").html("讀取中...")
                                    createTable(snapshotWacc.val(), snapshotNum.val(), $("#code").val());
                                    pause = false;
                                });
                            }else{ //沒有該房間的玩家資料
                                createUser($("#code").val(), $("#account").val(), false);
                            }
                        });
                    }else{
                        $("#statusbar").html("房間不存在！")
                        $("#btn_login").css("filter", "grayscale(0%)");
                        pause = false;
                    }
                });
                pause = true;
            }else{
                $("#statusbar").html("請填寫代號與帳號")
                $("#btn_login").css("filter", "grayscale(0%)");
                pause = false;
            }
        }else{
            $("#btn_login").css("filter", "grayscale(100%)");
            if($("#code").val() || $("#account").val()){
                $("#statusbar").html("")
                const dbRef = ref(getDatabase());
                const db = getDatabase();
                get(child(dbRef, $("#code").val())).then((snapshot) => {
                    if(snapshot.val() == null){
                        set(ref(db, $("#code").val() + "/BingoNumber"), {
                            Array: "0"
                        }).then(()=>{
                            createUser($("#code").val(), $("#account").val(), true);
                            $("#btn_login").css("filter", "grayscale(0%)");
                            pause = false;
                        });
                    }else{
                        $("#statusbar").html("房間已經存在！")
                        $("#btn_login").css("filter", "grayscale(0%)");
                        pause = false;
                    }
                });
                pause = true;
            }else{
                $("#statusbar").html("請填寫代號與帳號")
                $("#btn_login").css("filter", "grayscale(0%)");
                pause = false;
            }
        }
    }
})

$("#reload").click(function(){
    $("#bingoCard").text("");
    $("#reload").css("filter", "grayscale(100%)");
    const dbRef = ref(getDatabase());
    get(child(dbRef, $("#code").val() + '/' + $("#account").val())).then((snapshotWacc) => {
        if(snapshotWacc.val() != null){ //玩家已經存在
            get(child(dbRef, $("#code").val() + '/BingoNumber')).then((snapshotNum) => {
                $("#statusbar").html("讀取中...")
                createTable(snapshotWacc.val(), snapshotNum.val(), $("#code").val());
                pause = false;
                $("#reload").css("filter", "grayscale(0%)");
            });
        }
    });
});

$("#addNum").click(function (e) { 
    const dbRef = ref(getDatabase());
    const db = getDatabase();
    get(child(dbRef, $("#code").val() + '/' + $("#account").val())).then((snapshotWacc) => {
        if(snapshotWacc.val() != null){
            get(child(dbRef, $("#code").val() + '/BingoNumber')).then((snapshotNum) => {
                if(snapshotWacc.val()["owner"] == true){
                    var number = prompt("清輸入新增的賓果號碼");
                    $("#addNum").css("filter", "grayscale(100%)");
                        update(ref(db, $("#code").val() + '/BingoNumber'), {
                            Array: snapshotNum.val()["Array"] + "," + number.toString()
                        }).then(()=>{
                            createTable(snapshotWacc.val(), snapshotNum.val(), $("#code").val());
                            $("#addNum").css("filter", "grayscale(0%)");
                        }
                        );
                }else{
                    alert("只有房主可以新增號碼。")
                }
            });
        }
    });
});