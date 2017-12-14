---------------------------------------------------------------------------------------
For access to AWS EC2 including security controls and intance sutdown/start control 
Login url:
https://www.amazon.com/ap/signin?openid.assoc_handle=aws&openid.return_to=https%3A%2F%2Fsignin.aws.amazon.com%2Foauth%3Fresponse_type%3Dcode%26client_id%3Darn%253Aaws%253Aiam%253A%253A015428540659%253Auser%252Fhomepage%26redirect_uri%3Dhttps%253A%252F%252Fconsole.aws.amazon.com%252Fconsole%252Fhome%253Fstate%253DhashArgs%252523%2526isauthcode%253Dtrue%26noAuthCookie%3Dtrue&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&action=&disableCorpSignUp=&clientContext=&marketPlaceId=&poolName=&authCookies=&pageId=aws.ssop&siteState=registered%2Cen_US&accountStatusPolicy=P1&sso=&openid.pape.preferred_auth_policies=MultifactorPhysical&openid.pape.max_auth_age=120&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&server=%2Fap%2Fsignin%3Fie%3DUTF8&accountPoolAlias=&forceMobileApp=0&language=en_US&forceMobileLayout=0

Username:
fbw218@lehigh.edu

Password:
valley
---------------------------------------------------------------------------------------

For file access to running server instance
To ssh:
ssh -i "ezFlowHost.pem" ec2-user@ec2-35-162-231-0.us-west-2.compute.amazonaws.com

---------------------------------------------------------------------------------------
Database access
Master user:
lehigh

Password:
bahespasu3eT

ssh string:
mysql -h ezflowdb.cblpqgmpzlek.us-west-2.rds.amazonaws.com -u lehigh -p

blankDBscript.sql
This should create all the necessary tables, Foreign keys, unique indexes and users necessary for 
the database. Easiest to create a database in mysql workbench using the gui then export the sql to 
run on our mysql instance on AWS.
