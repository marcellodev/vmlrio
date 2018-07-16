$(document).ready(function(){
    //$('#searchUser').on('keyup', function(e){
      //let username = e.target.value;
  
      // Make request to Github
      $.ajax({
        url:'https://api.github.com/users/globocom',
        data:{
          client_id:'4f5ec43ee154faa2ad56',
          client_secret:'b354e8ee81b3a43d38252b0bd5e650a09e001baf'
        }
      }).done(function(user){
        let page = retornaParam();
        $.ajax({
            url:'https://api.github.com/users/globocom/repos?page='+page+'&per_page=30',
            data:{
              client_id:'4f5ec43ee154faa2ad56',
              client_secret:'b354e8ee81b3a43d38252b0bd5e650a09e001baf',
            }
          }).done(function(repos){    
           
            $.each(repos, function(index, repo){

                $.ajax({
                    url:`https://api.github.com/repos/globocom/${repo.name}/contributors`,
                    data:{
                      client_id:'4f5ec43ee154faa2ad56',
                      client_secret:'b354e8ee81b3a43d38252b0bd5e650a09e001baf',
                    }
                  }).done(function(contri){
                    var countContri = contri.length;
                    $('#lista-repo').append(`                
                        <li class="list-group-item">
                            <a href="${repo.html_url}" class="">${repo.name}</a>
                            <span>Star: ${repo.stargazers_count}</span>
                            <span>Forks: ${repo.forks_count}</span>
                            <span>contributes: `+countContri+`</span>
                        </li>
                    `);                
                }); 
            });//fecha each repos
          });//fecha done repos
        $('#app header').html(`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-3">
                        <div class="avatar">
                            <img class="img-fluid" src="${user.avatar_url}" alt="logo globo.com">
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-9">
                        <input type="text" id="searchUser" class="form-control" placeholder="Github repositórios...">
                    </div>
                </div>  
            </div>     
        `);
        let reposQuant = parseInt(user.public_repos);
        let reposPag =  reposQuant / 30;
        if(reposQuant % 30 != 0){
            var countPag = parseInt(reposPag) + 1;
        }
        for(i=1; i<=countPag; i++ ){
            $('#app #repos .pagination ul').append(`
                <li class="page-item"><a class="page-link" href="?pag=`+i+`">`+i+`</a></li>          
            `);
        }
      });// fecha done user
    //});
});

function retornaParam(){
    //Array de parametros 'chave=valor'
    var params = window.location.search.substring(1).split('&');

    //Criar objeto que vai conter os parametros
    var paramArray = {};

    //Passar por todos os parametros
    for(var i=0; i<params.length; i++) {
        //Dividir os parametros chave e valor
        var param = params[i].split('=');

        //Adicionar ao objeto criado antes
        paramArray[param[0]] = param[1];
    }

    if(paramArray['pag'] == undefined){
        return 1;
    }else {
        return paramArray['pag'];
    }  
    
}
