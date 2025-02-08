    function getSingleVidReq(vidInfo){
        const vidReqContainerElm=document.createElement('div');
        vidReqContainerElm.innerHTML=`<div id="listOfRequests">
        <div class="card mb-3">
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
              <h3>${vidInfo.topic_title}</h3>
              <p class="text-muted mb-2">${vidInfo.topic_details}</p>
              <p class="mb-0 text-muted">
                <strong>Expected results:</strong>${vidInfo.expected_result}
              </p>
            </div>
            <div class="d-flex flex-column text-center">
              <a class="btn btn-link">🔺</a>
              <h3>0</h3>
              <a class="btn btn-link">🔻</a>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div>
              <span class="text-info">${vidInfo.status.toUpperCase()}</span>
              &bullet; added by <strong>${vidInfo.author_name}</strong> on
              <strong>${new Date(vidInfo.submit_date).toLocaleDateString()}</strong>
            </div>
            <div
              class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
              <div class="badge badge-success">
                ${vidInfo.target_level}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
        return vidReqContainerElm;
    }

document.addEventListener('DOMContentLoaded',function(){
    const formVidReq=document.getElementById('formVideoReq');
    const listOfVidsEle=document.getElementById('listOfRequests');
    fetch('http://localhost:7777/video-request').then((blod)=>blod.json()).then(data=>{
        data.forEach((vidInfo)=>{
          listOfVidsEle.appendChild(getSingleVidReq(vidInfo))
    })
    })




    formVidReq.addEventListener('submit',function(e){
      e.preventDefault();
      const formData= new  FormData(formVidReq)
      fetch('http://localhost:7777/video-request',{method : 'POST',
        body : formData,

      }).then((bold)=>bold.json()).then((data)=>console.log(data))
    })
  })
