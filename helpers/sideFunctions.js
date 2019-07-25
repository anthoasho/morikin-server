

exports.dataShuffle = function(array){
  let lastNum = array.length;
  let i;
  let swapper;
  while(lastNum){
    i = Math.floor(Math.random() * lastNum-- );
    swapper = array[lastNum];
    array[lastNum] = array[i];
    array[i] = swapper
  }
  return array
}


exports.combineData = (users, currentUser) => {
  let finalData = users.map(function(obj){
      let mappedFollowing = currentUser && obj.followers.some(e => e.toString() === currentUser.userId);
      let finalObject = {
        username: obj.username,
        profileImgUrl: obj.profileImgUrl,
        following: mappedFollowing,
        profileColor: obj.profileColor,
        displayName: obj.displayName
      }
    return finalObject;
  });
  return finalData;
}
