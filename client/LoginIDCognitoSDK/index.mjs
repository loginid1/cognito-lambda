var u=n=>{n=n.replace(/-/g,"+").replace(/_/g,"/");let e=atob(n),t=new Uint8Array(e.length);for(let o=0;o<e.length;o++)t[o]=e.charCodeAt(o);return t.buffer},s=n=>{let e=new Uint8Array(n),t="";for(let a=0;a<e.byteLength;a++)t+=String.fromCharCode(e[a]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};var f=async n=>{let{challenge:e}=n;if(n.challenge=u(n.challenge),n.user.id=u(n.user.id),n.excludeCredentials)for(let r of n.excludeCredentials)r.id=u(r.id);let t=await navigator.credentials.create({publicKey:n});if(!t)throw new Error("Failed to create credential");let o=t.response;return{attestation_response:{challenge:e,id:s(t.rawId),type:t.type,response:{attestationObject:s(o.attestationObject),clientDataJSON:s(o.clientDataJSON),...o.getTransports&&{transports:o.getTransports()}}}}},O=async n=>{let e=n.challenge;if(n.challenge=u(e),n.allowCredentials)for(let r of n.allowCredentials)r.id=u(r.id);let t=await navigator.credentials.get({publicKey:n});if(!t)throw new Error("Failed to authenticate credential");let o=t.response;return{assertion_response:{challenge:e,id:s(t.rawId),type:t.type,response:{clientDataJSON:s(o.clientDataJSON),signature:s(o.signature),authenticatorData:s(o.authenticatorData),userHandle:o.userHandle?s(o.userHandle):null}}}};import{AuthenticationDetails as U,CognitoUser as I,CognitoUserPool as E}from"amazon-cognito-identity-js";var p=class{userPool;constructor(e,t){this.userPool=new E({UserPoolId:e,ClientId:t})}handleAttestationOptions(e){let t={};return e.attestationOptions?.overrideTimeout!==void 0&&(t.override_timeout_s=e.attestationOptions.overrideTimeout),e.attestationOptions?.requireResidentKey!==void 0&&(t.require_usernameless=e.attestationOptions.requireResidentKey),t}async customAuthenticationPasskey(e,t,o,a){return new Promise((r,d)=>{let w={Username:e,Password:""},P={Username:e,Pool:this.userPool},g=new U(w),c=new I(P),m=a.metaData||{},_=this.handleAttestationOptions(a),T={customChallenge:async function(i){let l={...m,attestation_options:JSON.stringify(_),authentication_type:"FIDO2_CREATE"};if(i?.challenge==="AUTH_PARAMS"){c.sendCustomChallengeAnswer("AUTH_PARAMS",this,l);return}let A=JSON.parse(i.public_key),h=await f(A);c.sendCustomChallengeAnswer(JSON.stringify({...h,id_token:t}),this,l)},onSuccess:function(i){r(i)},onFailure:function(i){d(i)}},D={customChallenge:async function(i){let l={...m,authentication_type:"FIDO2_GET"};if(i?.challenge==="AUTH_PARAMS"){c.sendCustomChallengeAnswer("AUTH_PARAMS",this,l);return}let A=JSON.parse(i.public_key),h=await O(A);c.sendCustomChallengeAnswer(JSON.stringify({...h}),this,l)},onSuccess:function(i){r(i)},onFailure:function(i){d(i)}};switch(o){case"FIDO2_CREATE":c.setAuthenticationFlowType("CUSTOM_AUTH"),c.initiateAuth(g,T);break;case"FIDO2_GET":c.setAuthenticationFlowType("CUSTOM_AUTH"),c.initiateAuth(g,D);break;default:throw new Error("Invalid custom authentication type")}})}},y=p;var C=class{cognito;constructor(e,t){this.cognito=new y(e,t)}async addPasskey(e,t,o){return this.cognito.customAuthenticationPasskey(e,t,"FIDO2_CREATE",o||{})}async signInPasskey(e,t){return this.cognito.customAuthenticationPasskey(e,"","FIDO2_GET",t||{})}},b=C;var K=b;export{K as default};
//# sourceMappingURL=index.mjs.map