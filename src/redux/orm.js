import { ORM } from "redux-orm";
import Policy from "./models/Policy";
import Section from "./models/Section";
import Field from "./models/Field";
import Answer from "./models/Answer";
import AnswerGroup from "./models/AnswerGroup";
import Peril from "./models/Peril";

export const orm = new ORM();
orm.register(Policy, Section, Field, Answer, AnswerGroup, Peril);

export default orm;
