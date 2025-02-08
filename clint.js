// عنصر HTML الذي يحتوي على قائمة طلبات الفيديو
const listOfVidsEle = document.getElementById('listOfRequests');
let sortBy = "newFirst";
let searchTerm = '';

// دالة لإنشاء وعرض طلب فيديو واحد في القائمة
function renderSingleVidReq(vidInfo, isPrepend = false) {
    // إنشاء عنصر يحتوي على تفاصيل الطلب
    const vidReqContainerElm = document.createElement('div');
    vidReqContainerElm.innerHTML = `
    <div class="card mb-3">
      <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
          <h3>${vidInfo.topic_title}</h3>
          <p class="text-muted mb-2">${vidInfo.topic_details}</p>
          <p class="mb-0 text-muted">
            ${vidInfo.expected_result && `<strong>Expected results:</strong> ${vidInfo.expected_result}`}
          </p>
        </div>
        <div class="d-flex flex-column text-center">
          <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
          <h3 id="score_vote_${vidInfo._id}">${vidInfo.votes.ups - vidInfo.votes.downs}</h3>
          <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
        </div>
      </div>
      <div class="card-footer d-flex flex-row justify-content-between">
        <div>
          <span class="text-info">${vidInfo.status.toUpperCase()}</span>
          &bullet; added by <strong>${vidInfo.author_name}</strong> on
          <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
        </div>
        <div class="badge badge-success">${vidInfo.target_level}</div>
      </div>
    </div>`;

    // إضافة الطلب إلى القائمة (إما في البداية أو النهاية)
    if (isPrepend) {
        listOfVidsEle.prepend(vidReqContainerElm);
    } else {
        listOfVidsEle.appendChild(vidReqContainerElm);
    }

    // إضافة أحداث التصويت (رفع وخفض)
    const voteUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`);
    const scoreElm = document.getElementById(`score_vote_${vidInfo._id}`);
    const voteDownsElm = document.getElementById(`votes_downs_${vidInfo._id}`);

    voteUpsElm.addEventListener('click', () => {
        fetch("http://localhost:7777/video-request/vote", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: vidInfo._id, vote_type: 'ups' })
        }).then(res => res.json()).then(data => {
            scoreElm.innerText = data.ups - data.downs;
        });
    });

    voteDownsElm.addEventListener('click', () => {
        fetch("http://localhost:7777/video-request/vote", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: vidInfo._id, vote_type: 'downs' })
        }).then(res => res.json()).then(data => {
            scoreElm.innerText = data.ups - data.downs;
        });
    });
}

// دالة تحميل جميع طلبات الفيديو مع الفرز والبحث
function loadAllVidReqs(sortBy = "newFirst", searchTerm = '') {
    fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
            listOfVidsEle.innerHTML = '';
            data.forEach(vidInfo => {
                renderSingleVidReq(vidInfo);
            });
        });
}

// دالة تأخير تنفيذ البحث عند الكتابة لتقليل عدد الطلبات
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// تنفيذ الكود بعد تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function () {
    const formVidReq = document.getElementById('formVideoReq');
    const sortbyElms = document.querySelectorAll('[id*=sort_by_]');
    const searchBoxElm = document.querySelector("#search-box");

    // تحميل الطلبات عند بداية التشغيل
    loadAllVidReqs();

    // إضافة أحداث الفرز عند النقر على خيارات الفرز
    sortbyElms.forEach(elm => {
        elm.addEventListener("click", function (e) {
            e.preventDefault();
            sortBy = this.querySelector('input').value;
            loadAllVidReqs(sortBy, searchTerm);
            this.classList.add('active');

            if (sortBy === "topVotedFirst") {
                document.getElementById('sort_by_new').classList.remove('active');
            } else {
                document.getElementById('sort_by_top').classList.remove('active');
            }
        });
    });

    // إضافة حدث البحث مع استخدام `debounce` لتقليل عدد الطلبات
    searchBoxElm.addEventListener('input', debounce((e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        loadAllVidReqs(sortBy, searchTerm);
    }, 1000));

    // إرسال نموذج إضافة طلب فيديو جديد
    formVidReq.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(formVidReq);
        fetch('http://localhost:7777/video-request', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then(data => {
            renderSingleVidReq(data, true);
        });
    });
});
