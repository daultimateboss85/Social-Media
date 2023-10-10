
document.addEventListener("DOMContentLoaded",function(){
    gposts();

    //create new post
    document.querySelector("#postform").onsubmit = (event) => {
  
        event.preventDefault();
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
            gposts();
            document.querySelector("#postdata").value = ""
        })
        .catch(error => console.log(error))
    }

    //loading feed page
    let feed = document.querySelector("#feedpage");
    feed.addEventListener("click", ()=>{
        clearscreen();
        document.querySelector("#feed").style.display = "block";
        gposts(path=`/posts/feed/self`);
    })

    //clicking on username in navbar loads profile
    let profile = document.querySelector("#mainusername");
    profile.addEventListener("click", function(){
        clearscreen();
        //get and display user data
        guserdata(this.dataset.id);
        //get and display user posts
        gposts(path= `/posts/user/${this.dataset.id}`, batch=0);
    })
})

function clearscreen(){
    document.querySelector("#userinfo").style.display = "none";
    document.querySelector("#newpost").style.display = "none";
    document.querySelector("#postscontainer").style.display = "none";
    document.querySelector("#feed").style.display = "none";
}

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
    document.querySelector("#postscontainer").style.display = "block";
    document.querySelector("#postscontainer").innerHTML="";

    let posts_div  = document.createElement("div");
    posts_div.style.minHeight = "30rem";
    posts_div.setAttribute("id", "posts-div");

    document.querySelector("#postscontainer").appendChild(posts_div);
    
    posts.forEach((value)=>{

        //post container
        let postarea = document.createElement("div");
        postarea.classList.add("postarea");
         
        //header of posts
        let header_div = document.createElement("div");
        header_div.setAttribute("id","headerdiv");
        //username ---------------------------------------
        let username = document.createElement("span");
        username.innerHTML = value.user;
        username.classList.add("user")

        //clicking on username loads profile page
        username.addEventListener("click",() =>{
            //clear screen
            clearscreen();
            
            //get and display user data
            guserdata(user=value.user_id);
            //get and display user posts
            gposts(path= `/posts/user/${value.user_id}`, batch=0);
        })

        //time ---------------------------------
        let time = document.createElement("span");
        time.innerHTML = value.time;
        time.classList.add("posttime");

        header_div.append(username,time);
        //text ------------------------------------
        let text_div = document.createElement("div");
        let text = document.createElement("div");
        text.setAttribute("id", `post${value["post_id"]}`)
        text_div.append(text);
        text.innerHTML = "<pre>" + value.text + "</pre>";

        //editing own posts-------------------------------
        if (value["editable"] == "true"){
            text_div.addEventListener("dblclick", (event) => {

                //form that replaces text -----------------------------
                let form = document.createElement("form");
                form.setAttribute("action", `/edit/${value["post_id"]}`)
                form.setAttribute("method", "post");
                let textarea = document.createElement("textarea");
                
                textarea.innerHTML = value.text;
                textarea.setAttribute("name","text");
                textarea.classList.add("form-control");
                textarea.classList.add("replaceform");

                let submit = document.createElement("button");
                submit.innerHTML = "Edit";
                submit.setAttribute("type", "submit");
                submit.classList.add("btn", "btn-outline-secondary");
                form.append(textarea, submit);
                document.querySelector(`#post${value["post_id"]}`).replaceWith(form);
                
                form.addEventListener("submit",(event) =>{
                    event.preventDefault();
                    fetch(form.action,{
                        method:"POST",
                        body: new FormData(form)
                    })
                    .then(res => res.json()) 
                    .then(result => { gposts(path,batch);})

                })
            } )
        }
    
        //like button-----------------------
        let button_div = document.createElement("div");
        button_div.classList.add("buttondiv");

        let likebutton = document.createElement("button");
        
        likebutton.classList.add("heart-button")
        likebutton.innerHTML =  "<span class='material-symbols-outlined '>local_fire_department</span>"
        likebutton.setAttribute("id",`but${value["post_id"]}`);
        //trash button-----------------------
        let trashbutton = document.createElement("button");
       // trashbutton.setAttribute("id", "heart")
        trashbutton.classList.add("heart-button")
        trashbutton.innerHTML =  "<span class='material-symbols-outlined '>delete</span>"

        //like button event----
        //straight up add effect if liked

        fetch(`/${value["post_id"]}/check`,
        {method:"post"})
        .then(res => res.json())
        .then(result => {
            
            //button_div.innerHTML = button_div.innerHTML + result["num_likes"];
            let likes_span = document.createElement("span");
            likes_span.setAttribute("id",`likes${value["post_id"]}`);
            likes_span.innerHTML = result["num_likes"];

            button_div.append(likes_span);
            if (result["liked"] == "true"){
                likebutton.classList.add("font-effect-fire");
            }
        })

        likebutton.onclick = function (){
            fetch(`/${value["post_id"]}/like`,{
            method: "post"})
            .then(res => res.json())
            .then(result => {
                
                document.querySelector(`#likes${value["post_id"]}`).innerHTML = result["num_likes"];
                
                if (result["liked"] == "true"){
                    this.classList.add("font-effect-fire");
                }
                else{
                    this.classList.remove("font-effect-fire");
                }
            })
        } 

        button_div.append(likebutton)
        postarea.append(header_div,text_div,button_div);
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

function guserdata (user){
    //get and display user data

    fetch(`/userdata/${user}`)
    .then(res => res.json())
    .then(userdata => {

        //make user info div visible
        let user_div = document.querySelector("#userinfo");
        user_div.innerHTML = "";
        user_div.style.display = "flex";

        let namediv = document.createElement("div");
        namediv.setAttribute("id","namediv");

        let icon = document.createElement("div");
        icon.setAttribute("id", "iconcontainer")
        icon.innerHTML = "<span id ='icon' class='material-symbols-outlined'>account_circle</span>"
        icon.style.textAlign = "right";

        let username = document.createElement("div");
        username.setAttribute("id", "userprofname")
        username.innerHTML = userdata["username"];

        let follows = document.createElement("span");
        follows.innerHTML = "Follows: " + userdata["followed"];

        let followers = document.createElement("span");
        followers.innerHTML = "Followers: " + userdata["followers"] + " ";
       
        namediv.append( username, followers, follows);
    
        user_div.append(icon,namediv);
        
        //follow/unfollow button
        let button_div = document.createElement("div");  
        fetch(`/verify/${userdata["id"]}`)
        .then(res => res.json())
        .then(result =>{
            //if checking profile that is not yours show follow/ unfollow button
            if (result["same"] != "true"){
                let follow_button = document.createElement("button");
                follow_button.setAttribute("id","followbutton");
                follow_button.classList.add("btn","btn-outline-secondary");

                if (result["follow"]=="true"){
                    follow_button.innerHTML = "Unfollow";
                }
                else{
                    follow_button.innerHTML = "Follow";
                }
               
                document.querySelector("#iconcontainer").append(button_div);
                button_div.append(follow_button);

                follow_button.onclick = ()=>{
                    //follow or unfollow depending on current status
                    fetch(`/following/${userdata["id"]}`,{
                        method:"POST"
                    })
                    .then(res => res.json())
                    .then(result => {
                        guserdata(user=userdata["id"]);
                    })
                   
                }  
            }
        })
    })
}