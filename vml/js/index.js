$(document).ready(function(){
   
    $.ajax({
        url:'https://api.github.com/users/globocom',
        data:{
            client_id:'4f5ec43ee154faa2ad56',
            client_secret: 'b354e8ee81b3a43d38252b0bd5e650a09e001baf'
        }
      }).done(function(user){
        $.ajax({
            url: 'https://api.github.com/users/globocom/repos?page='+retornaParam()+'&per_page=30',
            data:{
                client_id:'4f5ec43ee154faa2ad56',
                client_secret: 'b354e8ee81b3a43d38252b0bd5e650a09e001baf'
            }
          }).done(function(repos){    
           
            $.each(repos, function(index, repo){

                $.ajax({
                    url:`https://api.github.com/repos/globocom/${repo.name}/contributors`,
                    data:{
                        client_id:'4f5ec43ee154faa2ad56',
                        client_secret: 'b354e8ee81b3a43d38252b0bd5e650a09e001baf'
                    }
                  }).done(function(contr){
                      if(contr){
                       var contrQuant = contr.length; 
                      }
                    $('#lista-repo').append(`                
                        <li class="list-group-item">
                            <div class="infos">
                                <a href="https://api.github.com/repos/globocom/${repo.name}/commits" alt="Repositório ${repo.name}" title="Repositório ${repo.name}" class="">${repo.name}</a>
                                <div class="dados">
                                    <span class="badge badge-primary">Star: ${repo.stargazers_count}</span>
                                    <span class="badge badge-secondary">Forks: ${repo.forks_count}</span>
                                    <span class="badge badge-success">contributes:`+ contrQuant +`</span>
                                </div>
                            </div>
                        </li>
                    `);
                    ajaxCharts();                 
                });
                
            });//fecha each repos
            
          });//fecha done repos
        $('#app header').html(`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="avatar">
                            <img class="img-fluid" src="${user.avatar_url}" alt="logo globo.com" title="logo globo.com">
                        </div>
                    </div>
                </div>  
            </div>     
        `);

        //
        //Paginação
        //
        let reposQuant = parseInt(user.public_repos);
        let reposPag =  reposQuant / 30;
        
        if(reposQuant % 30 != 0){
            var countPag = parseInt(reposPag) + 1;
        }

        for(let i=1; i<=countPag; i++ ){
            if(retornaParam() == i){
                $('#app #repos nav ul').append(`
                    <li class="page-item active"><a class="page-link" href="#">`+i+`</a></li>          
                `);
            } else {
                $('#app #repos nav ul').append(`
                    <li class="page-item"><a class="page-link" href="?pag=`+i+`">`+i+`</a></li>          
                `);
            }
        }
        
      });// fecha done user
  
});
$( "#lista-repo" ).animate({opacity: 1}, 2000);

//
// Funções 
//


function retornaParam(){
    var params = window.location.search.substring(1).split('&');
    var paramArray = {};

    for(var i=0; i<params.length; i++) {
        var param = params[i].split('=');
        paramArray[param[0]] = param[1];
    }

    if(paramArray['pag'] == undefined){
        return 1;
    }else {
        return paramArray['pag'];
    }  
    
}

function quantidadeDatasPossiveis(anoMax, anoMin, mesMax, mesMin){
    if(anoMax == anoMin){
        return (mesMax - mesMin)+1;
    } else if(anoMax - anoMin != 1){
        return (13 - mesMin) + (((anoMax - anoMin)-2)*12) + mesMax; 
    } else{
        return (13 - mesMin) + mesMax;
    }
}

function chart(data, commits){
    var chart = c3.generate({
        padding: {
            top:40,
            right:20
        },
        data: {
            x: 'x',
            columns: [
            ],
        },
        
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%m/%Y',
                }
                
            }
        }
    });
    chart.load({
        columns: [
            data,
            commits
        ]
    });
}

function ajaxCharts(){

    $('ul#lista-repo li a').on('click',function(e){
        e.preventDefault();
        $('ul#lista-repo li div#chart').remove();
        let url = $(this).attr('href');
        $(this).parent().parent().append('<div id="chart"></div>');
        

        $.ajax({
            url:url,
            data:{
              client_id:'4f5ec43ee154faa2ad56',
              client_secret: 'b354e8ee81b3a43d38252b0bd5e650a09e001baf'
            }
          }).done(function(comt){
        
                let totalCommits = comt.length - 1;
                let anoMax = parseInt(comt[0].commit.committer.date.slice(0,4));
                let anoMin = parseInt(comt[totalCommits].commit.committer.date.slice(0,4));
        
                let mesMax = parseInt(comt[0].commit.committer.date.slice(5,7));
                let mesMin = parseInt(comt[totalCommits].commit.committer.date.slice(5,7));
                
                //
                //Criando array de datas com base na primeira e ultima data de commit e completando com as datas que não houveram commit
                //
                var dateChart = ['x'];
                for(let i = 1; i <= quantidadeDatasPossiveis(anoMax, anoMin, mesMax, mesMin);){
                    for(let j = anoMin; j <= anoMax; j++){
                        if(anoMax == anoMin){
                            for(let k = mesMin; k <= mesMax; k++){
                                dateChart[i]= ""+j+"-"+k+"-01";
                                i++;                        
                            } 
                        } else {
                            if(j == anoMin){
                                for(let k = mesMin; k <= 12; k++){
                                    dateChart[i] = ""+j+"-"+k+"-01"; 
                                    i++;                   
                                } 
                            } else if(j == anoMax){
                                for(let k = 1; k <= mesMax; k++){                                
                                    dateChart[i]= ""+j+"-"+k+"-01";
                                    i++;
                                } 
                            } else {
                                for(let k = 1; k <= 12; k++){
                                    dateChart[i] = ""+j+"-"+k+"-01";
                                    i++;
                                }
                            }
                        }                   
                    }
                } 
        
                //
                //Associando array de datas com as datas dos commits
                //
                var commitsCount = 0;
                var commitsAssoc = ['Commits'];
                var treino = [];
        
                $.each(comt, function(index, com){             
                    treino[index] = parseInt(com.commit.committer.date.slice(0,4)) + '-' + parseInt(com.commit.committer.date.slice(5,7)) + '-01';             
                });
        
                for(let i = 1; i <= dateChart.length; i++){
                    for(let j = 0; j <= treino.length - 1; j++){
                        if(dateChart[i] == treino[j]){
                            commitsCount++
                            commitsAssoc[i] = commitsCount;
                        } else if(isNaN(commitsAssoc[i])){
                            commitsAssoc[i] = 0;
                        }
                    }
                }
                
                
                chart(dateChart, commitsAssoc);
                
        });
        
    });
}


