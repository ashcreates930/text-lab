import {NextResponse} from "next/server";
import {z} from "zod";
import {getClassroomStore} from "@/lib/classroom/store";
import {createStudentToken} from "@/lib/classroom/auth";
import {readWorld} from "@/lib/classroom/worlds";
import {generateResumePhrase,hashResumePhrase} from "@/lib/resume";
const Input=z.object({classCode:z.string().trim().min(4).max(24),nickname:z.string().trim().min(1).max(32),resumePhrase:z.string().trim().optional()});
// Students join with a class code and nickname, never an email or password. The response carries a signed class token
// the browser keeps for this session so the student can see assigned lessons and take part in live class analysis.
export async function POST(request:Request){
  const input=Input.safeParse(await request.json().catch(()=>null));if(!input.success)return NextResponse.json({error:"Enter your class code and nickname."},{status:400});
  const store=getClassroomStore();if(!store)return NextResponse.json({error:"Class sessions are not configured yet."},{status:503});
  const session=await store.findActiveClassByCode(input.data.classCode);if(!session)return NextResponse.json({error:"We couldn’t find an active class with that code."},{status:404});
  const world=await readWorld(session.world_id);if(!world)return NextResponse.json({error:"This class story is unavailable."},{status:404});
  if(world.teacher_preview_required===true&&!session.preview_enabled)return NextResponse.json({error:"Your teacher must preview and enable this story for the class first."},{status:403});
  const sessionOut={id:session.id,world_id:session.world_id,grade:session.grade,name:session.name};
  if(input.data.resumePhrase){const student=await store.findStudentByResume(session.id,input.data.nickname,hashResumePhrase(input.data.resumePhrase));if(!student)return NextResponse.json({error:"Those details did not match saved progress."},{status:404});return NextResponse.json({student:{id:student.id,nickname:student.nickname},session:sessionOut,token:createStudentToken(student.id)})}
  const resume=generateResumePhrase();const student=await store.createStudent(session.id,input.data.nickname,hashResumePhrase(resume));
  if(student==="taken")return NextResponse.json({error:"That nickname is already in use for this class."},{status:400});
  return NextResponse.json({student:{id:student.id,nickname:student.nickname},session:sessionOut,resumePhrase:resume,token:createStudentToken(student.id)});
}
