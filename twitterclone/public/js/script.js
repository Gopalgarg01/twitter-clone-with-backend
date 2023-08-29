

$("#postTextarea", "#replyTextarea").keyup(event =>{
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;
    
    var submitButton = isModal ? $("#submitreplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if(value == ""){
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);
})

$("#replyModal").on("show.bs.modal", (event) =>{
    
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    console.log(postId);

    $("#submitreplyButton").data("id", postId);

    $.get("/api/posts/" + postId , results =>{
        outputPosts(results.postData, $("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", (event) =>{
    $("#originalPostContainer").html("")
})


$("#PostDeleteModal").on("show.bs.modal", (event) =>{
    
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);   

    $("#PostDeleteButton").data("id", postId);
    
       
})
$("#PostDeleteButton").click((event) =>{
    var postId = $(event.target).data("id");
    
    
    $.ajax({
        url : `/api/posts/${postId}`,
        type : "DELETE",
        success : (data, status, xhr)=>{
            if(xhr.status != 202){
                alert("could not delete the post")
                return;
            }
            location.reload();
        }
    })

})

$("#submitPostButton, #submitreplyButton").click((event) =>{
    var button = $(event.target);
    
    var isModal = button.parents(".modal").length == 1;

    var textbox = isModal ? $("#replyTextarea") :$("#postTextarea");
    console.log(textbox);

    var data = {
        content: textbox.val()
    }

    if(isModal){
        var id = button.data().id;
        if(id == null) return alert("button id is null");
        data.replyTo = id;
    }
    $.post("/api/posts", data, postData=>{

        if(postData.replyTo){
            location.reload();
        }else{
            var html = createPosthtml(postData);
            // console.log(html);
            $(".postContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }

        
    })
})



// chat button


//like button
$(document).on("click" , ".likebutton" ,(event) =>{
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;
    
    $.ajax({
        url : `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) =>{
            button.find("span").text(postData.likes.length || "")
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("red");
            }else{
                button.removeClass("red");
            }
            
        }
    })
})

// retweet button

$(document).on("click" , ".retweet" ,(event) =>{    
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) return;
    
    $.ajax({
        url : `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) =>{
            
            button.find("span").text(postData.retweetUsers.length || "")

            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("green");
            }else{
                button.removeClass("green");
            }
        }
    })
})

$(document).on("click" , ".post" ,(event) =>{  
    var element = $(event.target);
    var postId = getPostIdFromElement(element);
    
    if(postId !== undefined && !element.is("button")){

        

        window.location.href = '/posts/'+ postId;
    }
    
})



function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");    
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("post is undefined");

    return postId;
}

function createPosthtml(postData, largefont = false){

    if(postData == null) return alert("post object is null");
    
    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
   

    
    var times = timeDifference(new Date(), new Date(postData.createdAt));
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return console.log("user object not poputlated")
    }
    
    var buttonclassactive = postData.likes.includes(userLoggedIn._id)? "red" : "";
    var buttonclassgreeen = postData.retweetUsers.includes(userLoggedIn._id)? "green" : "";
    var displayName = postedBy.firstname + " " + postedBy.lastname;
    var largeFont = largefont? "largeFont" :  "";

    var retweetText = '';
    if(isRetweet){
        retweetText = `<span>Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a></span>`

    }

    var replyFlag = ""
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return alert("postedBy is not populated ");
        }else if(!postData.replyTo.postedBy._id){
            return alert("postedBy is not populated ")
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class="replyFlag">
                        Replying to <a href ='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }
    var buttons = "";
   
    
    if(postData.postedBy._id == userLoggedIn._id){
        
        buttons = `<button data-id=" ${postData._id}" data-bs-toggle='modal' data-bs-target='#PostDeleteModal' ><i class="fa-solid fa-trash"></i> </button> `
    }

    return `<div class ='post ${largeFont}' data-id= '${postData._id}'>
                

                
                <div class ='postActionContainer'>
                    ${retweetText}
                </div>
                <div class ='mainContentContainer'>
                    
                    <div class ='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>                 
                    
                    <div class ='postContentContainer'>
                        <div class ='header'> 
                            <a href='/profile/${postedBy.username}'>${displayName}</a>
                            <span class='username'>${postedBy.username}<span>
                            <span class='timestamp'>${times}<span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class ='postedBody'> 
                            <span>${postData.content}
                            
                            </span>
                        </div>
                        <div class ='postFooter'> 
                       
                            <div class='postButtonContainer'>
                                <button data-bs-toggle='modal' data-bs-target='#replyModal' > 
                                    <i class="fa-sharp fa-solid fa-comments"></i>
                                 </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button class="retweet ${buttonclassgreeen}"> <i class="fa-solid fa-retweet"></i> 
                                <span>${postData.retweetUsers.length}</span></button>
                            </div>
                            <div class='postButtonContainer'>
                                <button class="likebutton ${buttonclassactive}"> 
                                <i class="fa-solid fa-heart"></i> 
                                <span>${postData.likes.length}</span>
                            </button>
                            </div>
                        
                        </div>

                    </div>

                </div>
    
            </div>
            
            `;
}
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just Now";
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return  + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    container.html("");

    if(!Array.isArray(results)){
        results = [results];
    }

    results.forEach(result =>{
        var html = createPosthtml(result)
        container.append(html);
    })
    if(results.length == 0){
        container.append("<span class ='no resuls'> Nothing to show</span>")
    }
}

function outputPostsWithReplies(results, container){
    container.html("");


    if(results.replyTo !== undefined && results.replyTo._id !== undefined){
        var html = createPosthtml(results.replyTo);
        container.append(html);
    }

    var mainPosthtml = createPosthtml(results.postData, true);
        container.append(mainPosthtml);
    
 
    results.replies.forEach(result =>{
        var html = createPosthtml(result)
        container.append(html);
    })
    


}

