
class PeakClimbEngine {
  constructor() {
    this.width=800; this.height=1280;
    this.platforms=[{x:0,y:1220,w:800}];
    [260,370,460,340,230,120,230,350,460,570,460,350,240].forEach((x,i)=>this.platforms.push({x,y:1135-i*85,w:145}));
    this.reset();
  }
  reset() {
    this.player={x:290,y:1192,w:22,h:28,vx:0,vy:0};this.checkpoint=0;this.grounded=true;
    this.stars=new Set();this.falls=0;this.won=false;this.jumpHeld=false;
  }
  step(dt,input) {
    if(this.won)return;
    dt=Math.min(Math.max(dt,0),.03);
    const p=this.player,oldBottom=p.y+p.h;
    const jump=!!input.jump;
    p.vx=((input.right?1:0)-(input.left?1:0))*215;
    if(jump&&!this.jumpHeld&&this.grounded){p.vy=-455;this.grounded=false;}
    this.jumpHeld=jump;
    p.vy+=950*dt;p.x=Math.max(0,Math.min(this.width-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;
    this.grounded=false;
    if(p.vy>=0) {
      
      const hit=this.platforms.map((platform,i)=>({...platform,i})).filter(q=>oldBottom<=q.y+.5 && p.y+p.h>=q.y && p.x+p.w>q.x && p.x<q.x+q.w).sort((a,b)=>a.y-b.y)[0];
      if(hit){p.y=hit.y-p.h;p.vy=0;this.grounded=true;if(hit.i>this.checkpoint)this.checkpoint=hit.i;}
    }
    this.platforms.forEach((q,i)=>{if(i && !this.stars.has(i) && Math.hypot(p.x+p.w/2-(q.x+q.w/2),p.y+p.h/2-(q.y-25))<34)this.stars.add(i);});
    if(this.checkpoint===this.platforms.length-1 && this.grounded)this.won=true;
    const safe=this.platforms[this.checkpoint];
    if(p.y>safe.y+240 || p.y>this.height+30){this.falls++;p.x=safe.x+safe.w/2-p.w/2;p.y=safe.y-p.h;p.vx=0;p.vy=0;this.grounded=true;}
  }
}
if(typeof module!=='undefined')module.exports=PeakClimbEngine;
