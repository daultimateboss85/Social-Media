 """<script type="text/babel">
        function Post(props){
            return (
                <div className ="post">
                    <div>
                        <span className="postuser">{props.post.user}</span><span className="posttime">{props.post.time}</span>
                    </div>
                    <div>{props.post.text}</div>
                </div>
            )
        }

        
        function gposts(){
            return fetch("/posts")
            .then(response => response.json())
            .then(result=>{
               // console.log(result)
                root.render(
                    (
                        <div>
                            {result.map((item)=> <Post post={item} />)}
                        </div>
                    )
                )});
        }
        
        let posts = gposts();
        console.log(posts);

        const container = document.querySelector("#mydiv");
        const root = ReactDOM.createRoot(container);
       // root.render({posts})
        //posts()
        //console.log(posts);

       
            
        //root.render(<Post post={posts[0]} />)

    </script>
    
    
                    <ul style="display:block;">
                    <li style="display: inline;">One</li>
                    <li style="display: inline;">two</li>
                    <li style="display: block;float: right;">three</li>
                </ul>
"""