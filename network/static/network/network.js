
document.addEventListener("DOMContentLoaded",function(){
    gposts();
    //next button -------------------------
    document.querySelector("#next").onclick = () => 
    {//if batch > max_batch set it back to max_batch
        fetch("/max_batch/all")
        .then(response => response.json())
        .then(data=>{
            let max_batch = data["count"];
            if (parseInt(document.querySelector("#batch").value ) >= max_batch){
                gposts(batch=max_batch)
                document.querySelector("#batch").value = max_batch ;
            ;
            }
            else{
                
            gposts(batch=parseInt(document.querySelector("#batch").value)+1);
            document.querySelector("#batch").value = parseInt(document.querySelector("#batch").value)+1;}
        })
    }


    


    //previous button -------------------
    document.querySelector("#prev").onclick = () => 
    {
        //if batch is less than 0 put it to 1 
        if (parseInt(document.querySelector("#batch").value) < 0){
            document.querySelector("#batch").value = 1;
        }
        gposts(batch=parseInt(document.querySelector("#batch").value)-1);
        if (parseInt(document.querySelector("#batch").value) == 0){
            document.querySelector("#batch").value = 0;
        }
        else{document.querySelector("#batch").value = parseInt(document.querySelector("#batch").value)-1;}
    }

})


function gposts(batch=0){
    //function to get all posts
    fetch(`/posts/${batch}`)
    .then(response => response.json())
    .then(text=>{
    //gotten posts
        //clear "page"
        document.querySelector("#postscontainer").innerHTML="";
        text.forEach((value)=>{
       
            //post container
            let postarea = document.createElement("div");
            postarea.classList.add("postarea");
            
            //username ---------------------------------------
            let username = document.createElement("div");
            username.innerHTML = value.user;
            username.classList.add("user")

            //time ---------------------------------
            let time = document.createElement("span");
            time.innerHTML = value.time;
            time.classList.add("posttime");


            //text ------------------------------------
            let text = document.createElement("div");
            text.innerHTML = value.text;
        

            postarea.append(username,time,text);
            document.querySelector("#postscontainer").append(postarea);
          
            
        })
        console.log(text);
    })
}


