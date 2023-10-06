
document.addEventListener("DOMContentLoaded",function(){
    gposts();

    //create new post
    document.querySelector("#postform").onsubmit = (event) => {
  
        event.preventDefault();
        console.log("Is it here?");
        fetch("/postpost", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            
            body:JSON.stringify({
                text: document.querySelector("#postdata").value
            })
        })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            gposts();
            document.querySelector("#postdata").value = ""})
        .catch(error => console.log(error))
    }
})

//function to get posts 
function gposts(path="/posts",batch=0){
    //function to get all posts
    fetch(`${path}/${batch}`)
    .then(response => response.json())
    .then(text=>{
        dis_p(path = `${path}`,batch= text["batch"],text["posts"]);
    })
}

//function to display posts
function dis_p(path,batch=0,posts){
    //gotten posts
    //clear "page"
    document.querySelector("#postscontainer").innerHTML="";

    let posts_div  = document.createElement("div");
    posts_div.style.minHeight = "30rem";
    posts_div.setAttribute("id", "posts-div");

    document.querySelector("#postscontainer").appendChild(posts_div);
    
    posts.forEach((value)=>{
    
        //post container
        let postarea = document.createElement("div");
        postarea.classList.add("postarea");
         
        //username ---------------------------------------
        let username = document.createElement("div");
        username.innerHTML = value.user;
        username.classList.add("user")

        //clicking on username loads profile page
        username.addEventListener("click",() =>{
            //get user posts
            gposts(path= `/posts/user/${value.user_id}`, batch=0);
        })

        //time ---------------------------------
        let time = document.createElement("span");
        time.innerHTML = value.time;
        time.classList.add("posttime");

        //text ------------------------------------
        let text = document.createElement("div");
        text.innerHTML = value.text;
    
        //like button-----------------------
        let likebutton = document.createElement("button");
        
        likebutton.classList.add("heart-button")
        likebutton.innerHTML =  "<span class='material-symbols-outlined '>local_fire_department</span>"
        
        //trash button-----------------------
        let trashbutton = document.createElement("button");
        trashbutton.setAttribute("id", "heart")
        trashbutton.classList.add("heart-button")
        trashbutton.innerHTML =  "<span class='material-symbols-outlined '>delete</span>"

        //like button event----
        likebutton.onclick = function (){
            this.classList.add("font-effect-fire")
        }

        postarea.append(username,time,text,likebutton, trashbutton);
        document.querySelector("#posts-div").appendChild(postarea);
    })

    //buttons ---------------------------------------------------
    let button_div = document.createElement("div");
    button_div.setAttribute("id","button-div")
    button_div.style.textAlign = "center";

    //next button -------------------------
    let next_button = document.createElement("button");
    next_button.classList.add("btn")
    next_button.classList.add("btn-outline-secondary")
    next_button.innerHTML = "Next";

    next_button.onclick = () =>     
    {//if batch > max_batch set it back to max_batch
        fetch(`${path}/${batch+1}`)
        .then(response => response.json())
        .then(data=>{
            let new_batch = data["batch"];
            document.querySelector("#batch").value = new_batch;
                gposts(path=path,batch=new_batch);    
        })
    }
     //previous button -------------------
    let prev_button = document.createElement("button");

    prev_button.classList.add("btn")
    prev_button.classList.add("btn-outline-secondary")
    prev_button.innerHTML = "Previous";

    prev_button.onclick = () => 
     {
         //if batch is less than 0 put it to 1 
         fetch(`${path}/${batch-1}`)
         .then(response => response.json())
         .then(data=>{
             let new_batch = data["batch"];
             document.querySelector("#batch").value = new_batch;
                 gposts(path=path,batch=new_batch);
         })
     }   
    document.querySelector("#postscontainer").append(button_div);
    document.querySelector("#button-div").append(prev_button,next_button);
}