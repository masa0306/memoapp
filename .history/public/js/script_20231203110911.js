import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getDatabase, ref, push,onValue,get,set,remove } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
import { getStorage, ref as storageReference, uploadBytes,getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js';

const firebaseConfig = firebaseKey;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); //RealtimeDBに接続
const dbRef = ref(db, "record"); //RealtimeDB内の"chat"を使う
const storage =getStorage(app);
const storageRef = storageReference(storage); //strageを参照


// FFmpeg インスタンスの作成:
// import {reateFFmpeg, fetchFile } from 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js';
// const ffmpeg = createFFmpeg({ log: true }); //createFFmpeg 関数を呼び出して、新しい FFmpeg インスタンスを作成しています。
// if (!ffmpeg.isLoaded()) {
//     await ffmpeg.load();
// }




// 関数の定義
var key = localStorage.length
let recorder;
let photoElement

// カメラの利用準備
// https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia
let stream;
function cameraStart(){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(mediaStream=> { // アクセスが成功したときに実行される関数
        stream = mediaStream;
        const video = document.querySelector('video'); // video要素を取得
        video.srcObject = stream; // ビデオストリームをvideo要素のソースに設定
        video.play(); // ビデオを再生
      })
    .catch(function(error) { // アクセスが失敗したときに実行される関数
        console.error("Error accessing the camera", error); // コンソールにエラーメッセージを表示
    });
    
};

function photoStart(){
    const videoElement = document.querySelector('video'); // video要素を取得
    photoElement = document.querySelector('canvas'); // video要素を取得
    const context = photoElement.getContext('2d');
    context.drawImage(videoElement,0,0,videoElement.width,videoElement.height);
    document.getElementById("shutterSound").play();// シャッター音
    $("#video").fadeOut();
    console.log(stream);
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());//この行は、stream オブジェクトの全てのトラック（ビデオやオーディオなど）を取得し、それぞれのトラックに対して stop メソッドを呼び出します。forEach は配列の各要素に対して指定された関数を実行するJavaScriptのメソッドです。ここでは、各メディアトラックに対して stop メソッドを実行し、カメラやマイクのストリームを停止しています。
    }
}

// 動画の記録開始
// function startRecording(){
//     recordedChunks =[]; //一度空にする。restartのときは要注意
//     if (recorder.state === "inactive") {
//         recorder.start();
    //recorder = new MediaRecorder(stream);で、recorderは MediaRecorderオブジェクトを持っている。その中でstart()メソッドを呼び出す




// firebase格納時に利用するためグローバル変数として定義
var downloadURL;
// 動画に関するクリックイベントのまとめ
function videoControl(){
    $("#start").on("click",photoStart);
    // $("#pause").on("click",function(){
    //     recorder.pause();
    // });
    // $("#restart").on("click",function(){
    //     recorder.resume();
    // });
    // $("#finishSubmit").on("click",function(){
    //     if (recorder.state === "recording") {
    //         recorder.stop();
    //     }});
}




// スタートボタン
function start (){
    $("#start").on("click", function(){
        $("#finish").fadeIn();
        $("#start").fadeOut();
    });
};


// タイマー用
var timerInterval = null;  //setInterval(displayTimer, 1000); をいれてIntervalIDを格納。clearできるようにする必要がある。
var lastPauseTime = 0;
var pauseDuration = 0;
var elapsedTime = 0;
var startTime=0;
var finishTime=0;
var isTimerRunning = false;
var restartTime=0;
var elapsedTimeDuration




// 時間のカウントのタイマー
function timer(){
    function displayTimer(){
        if (!isTimerRunning){
            return;
        }
        console.log(startTime);
        elapsedTime =moment().diff(startTime)
        console.log(moment());
        elapsedTime -= pauseDuration;
        console.log(elapsedTime);
        var elapsedTimeDuration = moment.duration(elapsedTime);
        console.log(elapsedTimeDuration);
        var durationH = elapsedTimeDuration.hours();
        var durationM = elapsedTimeDuration.minutes();
        var durationS = elapsedTimeDuration.seconds();
        var timeFormatted = `${String(durationH).padStart(2, '0')}:${String(durationM).padStart(2, '0')}:${String(durationS).padStart(2, '0')}`;    
        $("#timer").html(timeFormatted);
        console.log(timeFormatted);
    };

    function startTimer(){
        isTimerRunning = true;
        startTime = moment();
        pauseDuration = 0;
        timerInterval = setInterval(displayTimer,1000);
        // https://www.sejuku.net/blog/24425
    };

    function pauseTimer(){
        lastPauseTime = moment();
        console.log(lastPauseTime);
        isTimerRunning = false;
        $('#pause').prop('disabled', true);
        $('#restart').prop('disabled', false);
    };

    function restartTimer(){
        restartTime = moment();
        console.log(restartTime);
        pauseDuration += restartTime.diff(lastPauseTime);
        console.log(pauseDuration);
        lastPauseTime=0
        restartTime=0
        setTimeout(function(){isTimerRunning = true;},500);
        $('#pause').prop('disabled', false);
        $('#restart').prop('disabled', true);
    };

    function finishTimer(){
        finishTime = moment();
        console.log(finishTime.diff(startTime))
        elapsedTime = finishTime.diff(startTime) - pauseDuration;
        
        elapsedTimeDuration = moment.duration(elapsedTime)
        console.log(elapsedTimeDuration); //milliseconds
        isTimerRunning = false;
    }
    
    // クリックイベントの処理
    displayTimer();
    $("#start").on("click", function () {
        startTimer();
        key++;
        // 日時を取得
        startTime= moment();
        console.log(startTime); 
        $("#pause").fadeIn();
        $("#restart").fadeIn();
    });

    $("#pause").on("click", pauseTimer)
    $("#restart").on("click", restartTimer)
    $("#finishSubmit").on("click", finishTimer)
};


// フィニッシュボタンによるモーダルの表示
function finishModal (){
    $("#finish").on("click", function(){
        $("#finishModal").fadeIn();
    });
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape'){
            $("#finishModal").fadeOut();
        }
      })
};

// async function videoRecord(){
//     // var compressedVideo;
//     // async function videoCompression(file){
//     //     ffmpeg.FS('writeFile', 'input.mp4',await fetchFile(file));
//     //     //ffmpeg.FS('writeFile', ...): FFmpegのファイルシステム（FS）にファイルを書き込むための関数です。この関数を使って、仮想ファイルシステムにファイルを保存します。
//     //     //'input.mp4': 仮想ファイルシステム上のファイル名です。
//     //     //fetchFile 関数は、指定されたファイル（ここでは file）を読み込み、そのデータをFFmpegのファイルシステムに書き込むために使用します。
//     //     await ffmpeg.run('-i', 'input.mp4', '-b:v', '1000k', 'output.mp4'); 
//     //     //ffmpeg.run(...) は FFmpeg コマンドを実行する関数です。この行では、input.mp4 ファイルを入力として、ビデオのビットレートを1000kbpsに設定し、output.mp4 として出力します。
//     //     const data = ffmpeg.FS('readFile', 'output.mp4');
//     //     //この行は、FFmpegのファイルシステムからoutput.mp4 ファイルを読み込み、その内容を data に格納します。ffmpeg.FS('readFile', ...) はファイルシステムからファイルを読み込む関数です。
//     //     compressedVideo = new Blob([data.buffer], { type: 'video/mp4' });
//     //     //「buffer」自体は、特定のメソッド（関数）やプログラムに固有のものではありません。
//     //     //一般的に、コンピューターのプログラミングにおいて「buffer」とは、一時的にデータを保存するための領域のことを指します。
//     //     //データを一時的に保管しておくことで、データを処理したり、別の場所に移動したりするのに便利です。
//     //     //たとえば、上記のコードで使われている data.buffer の場合、これはFFmpegがビデオファイルを処理した後に生成されるデータの領域を指します。
//     //     //FFmpegがビデオの圧縮や変換を行った後、その結果として生じるデータ（0と1の並び）がこの buffer 内に保存されます。
//     //     //そして、この buffer から新しいビデオファイル（Blobオブジェクト）を作成することができます。
//     //     //簡単に言うと、buffer は一時的にデータを保管する場所のことで、プログラムが作業を行う際によく使用されます。
//     // }

//     if (recorder.state === "recording") {
//         recorder.stop();
//     };
//     return new Promise((resolve, reject) => {
//         recorder.onstop =async function(){ //非同期関数 (async 関数) は、通常の関数とは異なり、内部で実行される非同期操作（ネットワークリクエスト、ファイルの読み書きなど）が完了するまでその結果を待機することができます。
//             const blob=new Blob(recordedChunks,{type:"video/webm"})
//             // videoCompression(blob);
//             const fileRef=storageReference(storage,'video'+startTime+'.webm')//保存先、ファイル名を指定
//             await uploadBytes(fileRef,blob); //strageに格納
//             console.log("Video uploaded to Firebase");
//             //await は JavaScript の非同期処理を扱うためのキーワードで、async 関数内で使用されます。このキーワードは、Promise（非同期処理の結果を表すオブジェクト）が完了するまで処理の実行を一時停止します。
//             downloadURL = await getDownloadURL(fileRef);
//             console.log(downloadURL);
//             saveToDatabase(downloadURL); 
//             resolve();
//     };

//     recorder.onerror = (error) => {
//         console.error("Error during video recording:", error);
//         reject(error);
//     };
//     });
// };


async function savePhotoToFirebase() {
    const photoData = photoElement.toDataURL("image/png");//photoElement（HTMLのCanvas要素）の内容をBase64エンコードされた画像データ（文字列）に変換しています
    console.log(photoData);
    const base64Response = await fetch(photoData); //fetch関数は通常、外部のリソースからデータを取得する際に使用されますが、ここではBase64エンコードされたデータ（photoData）を引数として使用しています。fetchはこのBase64文字列を内部でデコードし、その結果をレスポンスオブジェクト（base64Response）に格納します。
    const photoBlob = await base64Response.blob();//この行では、base64Responseオブジェクトの.blob()メソッドを使用して、デコードされたバイナリデータをBlobオブジェクトに変換しています。
    console.log(photoBlob);
    const fileRef=storageReference(storage,"img"+startTime+".png")
    await uploadBytes(fileRef,photoBlob);
    downloadURL = await getDownloadURL(fileRef);
    console.log(downloadURL);
};

async function saveToDatabase(){
    await savePhotoToFirebase();
    const finishTime= moment();
    console.log(startTime)
    console.log(finishTime); 

    // 今日のコミットメントの取得
    var finishOneword= $("#finishOneword").val().replace(/\n/g, '<br>'); 
    console.log(finishOneword); 
    // 今日の一言の取得
    const finishAchivement= $("#finishAchivement").val();
    console.log(finishAchivement); 

    // 日時の形式を変換する関数
    function timeFix(time){
        var result = time.format('YYYY/MM/DD HH:mm');
        // console.log(result);
        return result;
    };
    // startTime / finishTimeを保存したい形二変形
    var startTimeFixed;
    startTimeFixed = timeFix(startTime); // startTimeを修正したい形に変換
    // console.log(startTimeFixed); // 修正された日時をログに出力

    var finishTimeFixed = timeFix(finishTime); // finishTimeを修正したい形に変換
    // console.log(finishTimeFixed); // 修正された日時をログに出力

    // firebaseのストレージに保存する
    const msg={
        key:key,
        fileRef:downloadURL,
        startTimeFixed:startTimeFixed,
        finishTimeFixed:finishTimeFixed,
        elapsedTime:elapsedTime,
        finishOneword:finishOneword,
        finishAchivement:finishAchivement,
    }
    console.log(elapsedTime);
    const newPostRef = push(dbRef);
    set(newPostRef,msg)
    .then(() => {
        // location.reload();
    })
    .catch((error) => {
        // エラー処理
        console.error("Error writing to Firebase", error);
    });
};


// フィニッシュボタン
$("#finishSubmit").on("click", async function(){
    $("#finishSubmit").prop('disabled', true);
    await saveToDatabase();
});

var elapsedTimeTotalH=0;
var elapsedTimeTotalM=0;
var elapsedTimeTotalText;
function displayElapsedTimeTotal(){
    elapsedTimeTotalH= elapsedTimeTotalH + Math.floor(elapsedTimeTotalM/60)
    elapsedTimeTotalM= elapsedTimeTotalM%60
    elapsedTimeTotalText= (elapsedTimeTotalH)+"時間"+(elapsedTimeTotalM)+"分"
    console.log(elapsedTimeTotalText);
    let html=`
    <p>${elapsedTimeTotalText}</p>
    `
    $("#result").append(html);    
};

// これまでの過去の記録の取得
async function getList(){
//once('value')イベントリスナーを使用すると、Firebaseデータベースから特定のパスのデータを一度だけ取得し、
//そのデータを基に処理を行うことができます。これは、アプリケーションが起動時にデータベースの状態を読み込む際や、
//特定の時点でのデータベースの内容を確認する際に特に有効です。
    await get(dbRef).then((snapshot)=>{
        snapshot.forEach((childSnapshot)=>{
        const msg = childSnapshot.val();
        const key = childSnapshot.key;
        var elapsedTimeTotalText;
        // elapsedTimeを文字列に変換
        const elapsedTimeAll = (msg.elapsedTime/(60 * 1000));//millisecoundsを分単位に治す
        const elapsedTimeH = Math.floor(elapsedTimeAll/60);
        const elapsedTimeM = Math.ceil(elapsedTimeAll%60);
        const elapsedTimeText = (elapsedTimeH)+"時間"+(elapsedTimeM)+"分"
        let html =`
        <tr id="record${key}" class="record">
            <td align="center" class="recordContent">${msg.startTimeFixed}</td>
            <td align="center" class="recordContent"><img class="video" src="${msg.fileRef}"" width="400" height="300" controls></td>
            <td align="center" class="recordContent">${msg.finishTimeFixed}</td>
            <td align="center" class="recordContent">${elapsedTimeText}</td>
            <td align="center" class="recordContent">${msg.finishAchivement}</td>
            <td align="center" class="recordContent">${msg.finishOneword}</td>
        </tr>
        `
        $("#records").append(html);
        //これまでの勉強時間の合計を計算する
        console.log(elapsedTimeH)
        console.log(elapsedTimeM)
        elapsedTimeTotalH += elapsedTimeH;
        elapsedTimeTotalM += elapsedTimeM;
        console.log(elapsedTimeTotalH)
        console.log(elapsedTimeTotalM)
        })
    });
    await displayElapsedTimeTotal();
};

//これまでの勉強時間の合計を計算する
function totalElapsedTime(elapsedTime){
    
}

// データ削除
$("#clear").on("click", function () {
    var result = window.confirm("ほんとにすべてのデータ消しちゃうの？努力が水の泡よ？");
    if (result){
        remove(dbRef);
        location.reload()
        console.log('データをすべて削除しました');
    }else{
        console.log('データは削除されませんでした');
    }
});

$(document).ready(function() {
    cameraStart();
    videoControl();
    timer();
    start();
    getList();
    finishModal();
    $('#records').tablesorter({
        sortList: [[0,0]]
    });

});
