import type { DimensionId, ScoredQuizQuestion, TraitId } from "../../types";

const answer = (id: string, th: string, en: string, dimensions: Partial<Record<DimensionId, number>>, traits: Partial<Record<TraitId, number>> = {}) => ({ id, label: { th, en }, scores: { dimensions, traits } });
const question = (id: string, th: string, en: string, answers: ScoredQuizQuestion["answers"]): ScoredQuizQuestion => ({ id, prompt: { th, en }, answers });

export const questions: ScoredQuizQuestion[] = [
  question("q_social_01", "คุณมาถึงงานที่แทบไม่รู้จักใคร คุณจะเริ่มอย่างไร?", "You arrive at a gathering where you barely know anyone. How do you begin?", [
    answer("start_conversation", "ทักคนใกล้ ๆ และชวนคุยก่อน", "Introduce yourself and start a conversation.", { social: 3, expression: 1 }, { confidence: 0.3, enthusiasm: 0.2 }),
    answer("find_familiar", "หาเจ้าภาพหรือคนคุ้นเคยก่อน", "Find the host or someone familiar first.", { social: 1, responsibility: 1 }, { loyalty: 0.2 }),
    answer("observe_room", "สังเกตบรรยากาศก่อนค่อยเลือกคุย", "Read the room before choosing someone to talk to.", { social: -1, decision: 2 }, { introspection: 0.2 }),
    answer("quiet_corner", "อยู่เงียบ ๆ จนมีคนมาชวนคุย", "Stay quietly aside until someone approaches.", { social: -3, expression: -1 }, { independence: 0.2 }),
  ]),
  question("q_social_02", "ในทีมใหม่ที่ยังไม่คุ้นกัน คุณมักมีบทบาทแบบไหน?", "On a new team that does not know each other yet, what role do you take?", [
    answer("energize_team", "ชวนทุกคนแชร์ไอเดียเพื่อให้บรรยากาศคึกคัก", "Invite everyone to share ideas and energize the room.", { social: 3, expression: 2 }, { leadership: 0.3, enthusiasm: 0.2 }),
    answer("support_team", "ช่วยเชื่อมคนที่ยังไม่ได้พูดเข้ากับวงสนทนา", "Help quieter people enter the conversation.", { social: 2, responsibility: 1 }, { empathy: 0.3, acceptance: 0.2 }),
    answer("contribute_when_ready", "ฟังภาพรวมก่อน แล้วเสนอความเห็นเมื่อพร้อม", "Listen to the whole picture, then contribute when ready.", { social: -1, decision: 2 }, { knowledge: 0.2 }),
    answer("work_independently", "รับส่วนงานชัดเจนแล้วไปทำของตน", "Take a clear task and work independently.", { social: -2, lifestyle: 1 }, { independence: 0.3, discipline: 0.2 }),
  ]),
  question("q_social_03", "เมื่อเพื่อนชวนออกไปข้างนอกแบบกะทันหัน คุณมักจะ…", "When a friend invites you out at the last minute, you usually…", [
    answer("join_immediately", "ตอบตกลงทันที เพราะอยากเจอคน", "Say yes right away because you want company.", { social: 3, adventure: 1 }, { enthusiasm: 0.2 }),
    answer("invite_more", "ชวนคนอื่นเพิ่มเพื่อให้สนุกขึ้น", "Invite more people to make it more fun.", { social: 3, expression: 1 }, { leadership: 0.2, humor: 0.2 }),
    answer("check_energy", "ดูพลังงานและแผนของตัวเองก่อนตอบ", "Check your energy and plans before answering.", { social: -1, lifestyle: 2 }, { stability: 0.2 }),
    answer("prefer_private_time", "ขอใช้เวลาอยู่กับตัวเองในวันนี้", "Choose private time for yourself today.", { social: -3, expression: -1 }, { introspection: 0.3 }),
  ]),
  question("q_social_04", "เมื่อมีคนใหม่เข้ามาในกลุ่มเดิมของคุณ คุณจะ…", "When someone new joins your established group, you…", [
    answer("welcome_openly", "เข้าไปต้อนรับและชวนเข้าร่วมทันที", "Welcome them and invite them in right away.", { social: 3, responsibility: 1 }, { acceptance: 0.3, empathy: 0.2 }),
    answer("offer_practical_help", "เสนอความช่วยเหลือเรื่องที่เขาต้องรู้", "Offer practical help with what they need to know.", { social: 1, responsibility: 2 }, { reliability: 0.2 }),
    answer("watch_first", "รอดูว่าเขาสบายใจกับกลุ่มแบบไหน", "Wait to see what kind of interaction feels comfortable for them.", { social: -1, decision: 1 }, { sensitivity: 0.3 }),
    answer("keep_distance", "ให้พื้นที่เขาปรับตัวเองก่อน", "Give them space to settle in by themselves.", { social: -2, expression: -1 }, { independence: 0.2 }),
  ]),
  question("q_decision_01", "ข้อมูลสำคัญสองแหล่งให้คำตอบไม่ตรงกัน คุณจะ…", "Two important sources give conflicting answers. You…", [
    answer("verify_sources", "ตรวจที่มาและหลักฐานก่อนตัดสินใจ", "Verify the sources and evidence before deciding.", { decision: 3, lifestyle: 1 }, { knowledge: 0.3, curiosity: 0.2 }),
    answer("seek_expert", "ถามผู้เชี่ยวชาญที่เกี่ยวข้อง", "Ask an expert who knows the subject.", { decision: 2, social: 1 }, { learning: 0.2 }),
    answer("choose_values", "เลือกทางที่สอดคล้องกับหลักที่เชื่อ", "Choose the path that fits your principles.", { decision: -2, responsibility: 1 }, { ideals: 0.3 }),
    answer("trust_instinct", "ตัดสินจากสัญชาตญาณที่มีต่อสถานการณ์", "Decide from your instinct about the situation.", { decision: -3, adventure: 1 }, { confidence: 0.2 }),
  ]),
  question("q_decision_02", "เมื่อเพื่อนขอคำแนะนำเรื่องยาก คุณจะเริ่มจาก…", "When a friend asks for advice on something difficult, you start by…", [
    answer("map_options", "ช่วยแยกทางเลือกและผลที่ตามมา", "Mapping options and their consequences.", { decision: 3 }, { knowledge: 0.2, responsibility: 0.2 }),
    answer("ask_context", "ถามรายละเอียดเพื่อเข้าใจบริบทก่อน", "Asking for context before responding.", { decision: 2, social: 1 }, { empathy: 0.2, curiosity: 0.2 }),
    answer("affirm_feelings", "ยืนยันความรู้สึกของเขาก่อนให้ความเห็น", "Affirming their feelings before offering an opinion.", { decision: -2, expression: 1 }, { empathy: 0.3, sensitivity: 0.2 }),
    answer("share_personal", "เล่าประสบการณ์คล้ายกันของตัวเอง", "Sharing your own similar experience.", { decision: -1, expression: 2 }, { selfExpression: 0.2 }),
  ]),
  question("q_decision_03", "คุณต้องตัดสินใจภายใต้เวลาจำกัด คุณจะ…", "You must decide with limited time. You…", [
    answer("use_criteria", "ใช้เกณฑ์ที่เตรียมไว้เลือกทางที่เหมาะสุด", "Use prepared criteria to choose the strongest option.", { decision: 3, lifestyle: 2 }, { discipline: 0.2 }),
    answer("gather_key_fact", "เก็บข้อเท็จจริงสำคัญที่สุดให้เร็ว", "Gather the most important facts quickly.", { decision: 2, adventure: 1 }, { knowledge: 0.2 }),
    answer("protect_people", "เลือกทางที่ลดผลกระทบต่อคนมากที่สุด", "Choose the option that protects people most.", { decision: -2, responsibility: 2 }, { empathy: 0.3, selflessness: 0.2 }),
    answer("act_on_gut", "เลือกสิ่งที่รู้สึกว่าถูกแล้วลงมือ", "Choose what feels right and act.", { decision: -3, adventure: 2 }, { confidence: 0.2 }),
  ]),
  question("q_decision_04", "กฎข้อหนึ่งทำให้เกิดผลลัพธ์ไม่ยุติธรรม คุณจะ…", "A rule produces an unfair outcome. You…", [
    answer("challenge_with_case", "รวบรวมเหตุผลเพื่อเสนอแก้กฎ", "Build a reasoned case to change the rule.", { decision: 3, responsibility: 1 }, { nonconformity: 0.2, ideals: 0.2 }),
    answer("find_exception", "หาทางใช้กฎให้ยืดหยุ่นโดยยังเคารพหลักการ", "Find a flexible application while respecting the principle.", { decision: 2, lifestyle: -1 }, { adaptability: 0.3 }),
    answer("prioritize_compassion", "ช่วยคนที่เดือดร้อนก่อนแม้ต้องฝืนกฎ", "Help the person in need first, even if it bends the rule.", { decision: -3, responsibility: 2 }, { selflessness: 0.3 }),
    answer("follow_rule", "ทำตามกฎเดิมเพื่อลดความเสี่ยง", "Follow the rule to minimize risk.", { decision: 1, adventure: -2 }, { discipline: 0.2 }),
  ]),
  question("q_lifestyle_01", "เมื่อมีทริปที่ต้องเตรียมหลายอย่าง คุณจะ…", "When preparing for a trip with many moving parts, you…", [
    answer("make_itinerary", "ทำรายการและกำหนดเวลาคร่าว ๆ", "Make a checklist and a rough schedule.", { lifestyle: 3 }, { discipline: 0.3, reliability: 0.2 }),
    answer("pack_essentials", "เตรียมของจำเป็นแล้วค่อยปรับระหว่างทาง", "Pack essentials and adapt along the way.", { lifestyle: 1, adventure: 1 }, { adaptability: 0.2 }),
    answer("decide_later", "รอให้ใกล้วันแล้วค่อยคิดรายละเอียด", "Wait until closer to the day to decide details.", { lifestyle: -2 }, { freedom: 0.2 }),
    answer("follow_mood", "เลือกตามอารมณ์และโอกาสหน้างาน", "Follow your mood and the opportunities that appear.", { lifestyle: -3, adventure: 1 }, { freedom: 0.2 }),
  ]),
  question("q_lifestyle_02", "พื้นที่ทำงานของคุณมักเป็นแบบไหน?", "What is your workspace usually like?", [
    answer("organized_system", "มีที่ประจำและระบบหาของชัดเจน", "Everything has a place and a clear system.", { lifestyle: 3 }, { discipline: 0.3, stability: 0.2 }),
    answer("tidy_before_need", "ไม่ต้องเป๊ะตลอด แต่จัดก่อนเริ่มงานสำคัญ", "Not always perfect, but tidied before important work.", { lifestyle: 1 }, { reliability: 0.2 }),
    answer("creative_clutter", "ของเยอะตามไอเดีย แต่ฉันรู้ว่าของอยู่ไหน", "It is creatively cluttered, but I know where things are.", { lifestyle: -1, expression: 1 }, { creativity: 0.2 }),
    answer("wherever_available", "ใช้ตรงไหนสะดวกตอนนั้น", "I work wherever is convenient at the moment.", { lifestyle: -3, adventure: 1 }, { freedom: 0.2 }),
  ]),
  question("q_lifestyle_03", "ถ้าแผนทั้งวันถูกเปลี่ยนกะทันหัน คุณจะ…", "If your whole day is suddenly rearranged, you…", [
    answer("rebuild_plan", "จัดลำดับใหม่และปรับตารางทันที", "Reorder priorities and rebuild the schedule.", { lifestyle: 3, decision: 1 }, { discipline: 0.2, adaptability: 0.2 }),
    answer("keep_core", "รักษาสิ่งสำคัญที่สุดแล้วปล่อยส่วนที่เหลือ", "Protect the essentials and release the rest.", { lifestyle: 1, responsibility: 1 }, { stability: 0.2 }),
    answer("enjoy_change", "มองว่าเป็นโอกาสลองสิ่งใหม่", "See it as an opportunity to try something new.", { lifestyle: -2, adventure: 2 }, { freedom: 0.2, curiosity: 0.2 }),
    answer("go_with_flow", "ปล่อยให้วันพาไปโดยไม่วางแผนใหม่", "Let the day unfold without making a new plan.", { lifestyle: -3 }, { adaptability: 0.2 }),
  ]),
  question("q_lifestyle_04", "งานใหญ่ที่มีเวลาหลายสัปดาห์ คุณมัก…", "For a large task with several weeks to complete it, you usually…", [
    answer("start_early", "แบ่งงานเป็นช่วงและเริ่มเร็ว", "Break it into stages and start early.", { lifestyle: 3, responsibility: 1 }, { perseverance: 0.2, discipline: 0.3 }),
    answer("set_milestones", "ตั้งเป้าหมายย่อยแต่เผื่อเวลายืดหยุ่น", "Set milestones while leaving room to adapt.", { lifestyle: 2 }, { reliability: 0.2, adaptability: 0.2 }),
    answer("work_in_bursts", "รอจังหวะที่มีแรงบันดาลใจแล้วทำเป็นช่วง", "Wait for inspiration, then work in bursts.", { lifestyle: -2, expression: 1 }, { creativity: 0.2 }),
    answer("last_minute", "มักเร่งทำเมื่อเส้นตายใกล้", "Usually rush once the deadline is near.", { lifestyle: -3, adventure: 1 }, { confidence: 0.1 }),
  ]),
  question("q_adventure_01", "คุณพบเส้นทางใหม่ที่อาจพาไปถึงที่หมายเร็วกว่า คุณจะ…", "You find a new route that might reach the destination faster. You…", [
    answer("try_route", "ลองไปพร้อมเตรียมรับความเสี่ยง", "Try it while preparing for the risk.", { adventure: 3, decision: 1 }, { curiosity: 0.2, confidence: 0.2 }),
    answer("research_route", "หาข้อมูลเส้นทางก่อนตัดสินใจ", "Research the route before deciding.", { adventure: 1, decision: 2 }, { knowledge: 0.2 }),
    answer("ask_companions", "ถามทุกคนว่ารับความเสี่ยงนี้ได้ไหม", "Ask whether everyone can accept the risk.", { adventure: -1, responsibility: 2 }, { empathy: 0.2 }),
    answer("stay_known_route", "เลือกเส้นทางเดิมที่แน่นอนกว่า", "Stay with the proven route.", { adventure: -3, lifestyle: 1 }, { stability: 0.2 }),
  ]),
  question("q_adventure_02", "มีโอกาสเรียนทักษะใหม่ที่ยากและอาจล้มเหลว คุณจะ…", "You have a chance to learn a difficult skill and might fail. You…", [
    answer("accept_challenge", "ลองทันที เพราะอยากเห็นว่าทำได้แค่ไหน", "Take it immediately to see how far you can go.", { adventure: 3 }, { growth: 0.2, confidence: 0.2 }),
    answer("prepare_then_try", "เตรียมพื้นฐานก่อนแล้วค่อยลอง", "Build the basics first, then try.", { adventure: 1, lifestyle: 2 }, { learning: 0.3 }),
    answer("wait_for_support", "รอคนที่ทำเป็นมาช่วยเริ่มต้น", "Wait for someone experienced to help you start.", { adventure: -1, social: 1 }, { acceptance: 0.2 }),
    answer("avoid_failure", "เลือกสิ่งที่มั่นใจว่าจะทำได้ดีกว่า", "Choose something you are more certain you can do well.", { adventure: -3 }, { stability: 0.2 }),
  ]),
  question("q_adventure_03", "เมื่อเกิดปัญหาที่ไม่มีคู่มือบอกวิธีแก้ คุณจะ…", "When a problem has no manual solution, you…", [
    answer("experiment", "ทดลองวิธีใหม่อย่างเป็นขั้นตอน", "Experiment with new approaches step by step.", { adventure: 3, decision: 1 }, { creativity: 0.3, curiosity: 0.2 }),
    answer("adapt_known", "ดัดแปลงวิธีเดิมให้เหมาะกับสถานการณ์", "Adapt a familiar method to fit the situation.", { adventure: 1, lifestyle: -1 }, { adaptability: 0.3 }),
    answer("seek_advice", "ขอความเห็นก่อนลองสิ่งเสี่ยง", "Seek advice before trying something risky.", { adventure: -1, social: 1 }, { learning: 0.2 }),
    answer("wait_proven", "รอวิธีที่พิสูจน์แล้ว", "Wait for a proven solution.", { adventure: -3, lifestyle: 1 }, { reliability: 0.2 }),
  ]),
  question("q_adventure_04", "คุณได้รับคำชวนไปยังสถานที่ไม่คุ้นเคย คุณจะ…", "You are invited somewhere unfamiliar. You…", [
    answer("say_yes", "ตอบตกลง เพราะประสบการณ์ใหม่ดูน่าสนใจ", "Say yes because the new experience sounds exciting.", { adventure: 3, social: 1 }, { curiosity: 0.3 }),
    answer("plan_safely", "ไปถ้าตรวจข้อมูลและความปลอดภัยได้", "Go if you can check the details and safety first.", { adventure: 1, decision: 2 }, { responsibility: 0.2 }),
    answer("go_with_friend", "ไปถ้ามีคนคุ้นเคยไปด้วย", "Go if someone familiar comes along.", { adventure: -1, social: 2 }, { loyalty: 0.2 }),
    answer("decline", "ปฏิเสธเพราะอยากอยู่ในสภาพแวดล้อมที่รู้จัก", "Decline because you prefer familiar surroundings.", { adventure: -3 }, { stability: 0.2 }),
  ]),
  question("q_responsibility_01", "ในงานกลุ่มมีส่วนสำคัญที่ยังไม่มีใครรับ คุณจะ…", "An important part of a group task has no owner. You…", [
    answer("take_ownership", "รับผิดชอบเองเพื่อให้งานเดินต่อ", "Take ownership so the work keeps moving.", { responsibility: 3 }, { reliability: 0.3, leadership: 0.2 }),
    answer("coordinate_owner", "ช่วยหาคนเหมาะสมและติดตามความคืบหน้า", "Find the right owner and follow up.", { responsibility: 2, social: 1 }, { leadership: 0.2 }),
    answer("protect_scope", "ทำเฉพาะส่วนของตนให้เสร็จก่อน", "Finish your own scope first.", { responsibility: -1, lifestyle: 1 }, { independence: 0.2 }),
    answer("let_group_decide", "รอให้คนอื่นตัดสินใจว่าจะจัดการอย่างไร", "Wait for the group to decide how to handle it.", { responsibility: -3 }, { freedom: 0.1 }),
  ]),
  question("q_responsibility_02", "คุณให้สัญญาไว้ แต่เกิดเหตุที่ทำให้ทำตามได้ยาก คุณจะ…", "You made a promise, but an event makes it difficult to keep. You…", [
    answer("rearrange_to_keep", "ปรับแผนเพื่อรักษาคำพูดให้ได้", "Rearrange your plans to keep the promise.", { responsibility: 3, lifestyle: 1 }, { loyalty: 0.3, reliability: 0.2 }),
    answer("communicate_early", "แจ้งเร็วและหาทางเลือกที่รับผิดชอบร่วมกัน", "Tell them early and find a responsible alternative together.", { responsibility: 2, social: 1 }, { reliability: 0.2, empathy: 0.1 }),
    answer("prioritize_emergency", "เลือกเหตุจำเป็นก่อน แม้รู้สึกผิดกับคำสัญญา", "Prioritize the emergency, while acknowledging the promise.", { responsibility: 1, decision: -1 }, { empathy: 0.2 }),
    answer("avoid_conversation", "หวังว่าคงไม่มีใครจำได้", "Hope no one notices or remembers.", { responsibility: -3 }, { freedom: 0.1 }),
  ]),
  question("q_responsibility_03", "คุณเห็นคนหนึ่งทำพลาดและกำลังถูกตำหนิ คุณจะ…", "You see someone make a mistake and receive blame. You…", [
    answer("help_fix", "เข้าไปช่วยแก้ปัญหาและรับผิดชอบส่วนของตน", "Help fix the problem and own your part.", { responsibility: 3, social: 1 }, { empathy: 0.2, reliability: 0.2 }),
    answer("explain_fairly", "ช่วยอธิบายข้อเท็จจริงให้การตัดสินเป็นธรรม", "Clarify the facts so the judgment is fair.", { responsibility: 2, decision: 2 }, { ideals: 0.2 }),
    answer("offer_private_support", "ให้กำลังใจเขาเป็นการส่วนตัวหลังเหตุการณ์", "Support them privately after the event.", { responsibility: 1, expression: -1 }, { loyalty: 0.2 }),
    answer("stay_out", "ไม่เข้าไปยุ่งเพราะไม่ใช่เรื่องของตน", "Stay out because it is not your situation.", { responsibility: -3, social: -1 }, { independence: 0.1 }),
  ]),
  question("q_responsibility_04", "คุณมีหน้าที่ประจำที่ไม่มีใครเห็นผลทันที คุณจะ…", "You have a recurring duty whose results are not immediately visible. You…", [
    answer("do_consistently", "ทำอย่างสม่ำเสมอแม้ไม่มีคนชม", "Do it consistently even without recognition.", { responsibility: 3, lifestyle: 2 }, { discipline: 0.3, perseverance: 0.2 }),
    answer("improve_process", "หาวิธีทำให้ดีขึ้นและยั่งยืนกว่าเดิม", "Improve the process to make it more sustainable.", { responsibility: 2, decision: 1 }, { growth: 0.2 }),
    answer("rotate_duty", "เสนอให้แบ่งหน้าที่อย่างยุติธรรม", "Suggest rotating the responsibility fairly.", { responsibility: 1, social: 1 }, { acceptance: 0.2 }),
    answer("skip_when_unseen", "ทำเฉพาะตอนที่มีคนตรวจ", "Only do it when someone is checking.", { responsibility: -3 }, { freedom: 0.1 }),
  ]),
  question("q_expression_01", "เมื่อคุณภูมิใจในผลงานชิ้นหนึ่ง คุณมักจะ…", "When you are proud of something you made, you usually…", [
    answer("share_excitedly", "เล่าและแชร์ให้คนอื่นดูอย่างตื่นเต้น", "Excitedly share it with others.", { expression: 3, social: 2 }, { selfExpression: 0.3, confidence: 0.2 }),
    answer("show_to_trusted", "ให้คนที่ไว้ใจดูและขอฟังความเห็น", "Show trusted people and ask for feedback.", { expression: 1, social: 1 }, { sensitivity: 0.2 }),
    answer("let_work_speak", "ปล่อยให้ผลงานสื่อความหมายเอง", "Let the work speak for itself.", { expression: -1, decision: 1 }, { independence: 0.2 }),
    answer("keep_private", "เก็บไว้กับตัวเองก่อน", "Keep it private for now.", { expression: -3, social: -1 }, { introspection: 0.2 }),
  ]),
  question("q_expression_02", "เมื่อไม่เห็นด้วยกับคนที่มีอำนาจกว่า คุณจะ…", "When you disagree with someone more powerful, you…", [
    answer("state_directly", "บอกตรง ๆ พร้อมเหตุผล", "State it directly with your reasoning.", { expression: 3, decision: 2 }, { confidence: 0.3, nonconformity: 0.2 }),
    answer("prepare_message", "เรียบเรียงคำพูดและเลือกจังหวะเหมาะสม", "Prepare your message and choose the right moment.", { expression: 1, lifestyle: 1 }, { discipline: 0.2 }),
    answer("ask_questions", "ตั้งคำถามเพื่อชวนให้เขาเห็นอีกมุม", "Ask questions that invite another perspective.", { expression: 1, decision: 2 }, { acceptance: 0.2 }),
    answer("stay_silent", "เก็บความเห็นไว้ถ้าไม่จำเป็นต้องพูด", "Keep your view private unless speaking is necessary.", { expression: -3, social: -1 }, { stability: 0.2 }),
  ]),
  question("q_expression_03", "เมื่อรู้สึกหนักใจกับเรื่องส่วนตัว คุณมักจะ…", "When something personal weighs on you, you usually…", [
    answer("talk_openly", "เล่าความรู้สึกกับคนที่ไว้ใจ", "Talk openly with someone you trust.", { expression: 3, social: 1 }, { empathy: 0.2 }),
    answer("express_creatively", "ถ่ายทอดผ่านงานเขียน ศิลปะ หรือกิจกรรม", "Express it through writing, art, or activity.", { expression: 2 }, { creativity: 0.3, selfExpression: 0.2 }),
    answer("process_alone", "ใช้เวลาคิดและจัดการความรู้สึกคนเดียว", "Take time to think and process it alone.", { expression: -1, social: -1 }, { introspection: 0.3 }),
    answer("hide_it", "พยายามไม่ให้คนอื่นสังเกต", "Try not to let others notice.", { expression: -3 }, { resilience: 0.1 }),
  ]),
  question("q_expression_04", "เมื่อมีเรื่องตลกเกิดขึ้นในกลุ่ม คุณมักจะ…", "When something funny happens in a group, you usually…", [
    answer("amplify_fun", "ต่อยอดมุกให้ทุกคนหัวเราะ", "Build on it so everyone laughs.", { expression: 3, social: 2 }, { humor: 0.3, enthusiasm: 0.2 }),
    answer("laugh_with_group", "หัวเราะและร่วมบรรยากาศอย่างเป็นธรรมชาติ", "Laugh and naturally join the mood.", { expression: 1, social: 2 }, { acceptance: 0.2 }),
    answer("smile_quietly", "ยิ้มอยู่เงียบ ๆ แต่ไม่ค่อยพูดเพิ่ม", "Smile quietly without adding much.", { expression: -1, social: -1 }, { sensitivity: 0.1 }),
    answer("stay_composed", "รักษาท่าทีและฟังต่อ", "Stay composed and keep listening.", { expression: -3, decision: 1 }, { stability: 0.2 }),
  ]),
];

export const questionById = new Map(questions.map((item) => [item.id, item]));
export const questionCount = questions.length;
