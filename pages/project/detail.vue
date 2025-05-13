<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <header-bar
      title="项目详情"
      :show-search="false"
      @back="goBack"
    ></header-bar>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 项目封面图 -->
      <view class="project-cover">
        <image src="/static/image/placeholder.jpg" mode="aspectFill" class="cover-image"></image>
        <view :class="['status-badge', `status-${project.statusClass}`]">{{ project.statusText }}</view>
      </view>

      <!-- 项目基本信息 -->
      <view class="project-info-card">
        <text class="project-title">{{ project.title }}</text>
        
        <!-- 项目标签 -->
        <view class="project-tags">
          <view v-for="(tag, index) in project.tags" :key="index" :class="['tag', `tag-${tag.type}`]">
            {{ tag.text }}
          </view>
        </view>
        
        <!-- 基本信息 -->
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">项目类型</text>
            <text class="info-value">{{ project.type }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">开始日期</text>
            <text class="info-value">{{ project.startDate }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">团队规模</text>
            <text class="info-value">{{ project.teamSize }}人</text>
          </view>
          <view class="info-item">
            <text class="info-label">进度</text>
            <text class="info-value">{{ project.progress }}</text>
          </view>
        </view>
      </view>

      <!-- 项目描述 -->
      <view class="section-card">
        <view class="section-title">项目简介</view>
        <text class="section-content">{{ project.description }}</text>
      </view>

      <!-- 项目成果 -->
      <view class="section-card">
        <view class="section-title">项目成果</view>
        <text class="section-content">{{ project.achievements }}</text>
        
        <!-- 成果展示图 -->
        <view class="image-gallery">
          <image 
            v-for="(img, index) in project.images" 
            :key="index" 
            :src="img" 
            mode="aspectFill" 
            class="gallery-image"
            @click="previewImage(index)"
          ></image>
        </view>
      </view>

      <!-- 团队成员 -->
      <view class="section-card">
        <view class="section-title">团队成员</view>
        <view class="team-members">
          <view 
            v-for="(member, index) in project.teamMembers" 
            :key="index" 
            class="member-item"
          >
            <image :src="member.avatar" class="member-avatar"></image>
            <view class="member-info">
              <text class="member-name">{{ member.name }}</text>
              <text class="member-role">{{ member.role }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="share-btn" @click="shareProject">
        <SvgIcon name="fenxiang" size="32" color="#666"></SvgIcon>
        <text>分享项目</text>
      </view>
      <button class="primary-btn" @click="contactTeam">联系团队</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import SvgIcon from '@/components/SvgIcon.vue';

// 项目数据
const project = ref({});
const loading = ref(true);
const projectId = ref(null);


// 获取项目详情
function getProjectDetail(id) {
  // 模拟项目数据 - 实际项目中应从服务器获取
  const projectsData = [
    {
      id: 1,
      title: '智能校园导航系统',
      description: '基于AR技术的校园导航系统，提供实时路线规划和校园信息查询功能，帮助新生和访客快速熟悉校园环境。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '创新创业项目',
      startDate: '2025-04-15',
      teamSize: 5,
      progress: '原型开发阶段',
      category: '创新创业',
      tags: [
        { text: '技术创新', type: 'blue' },
        { text: 'AR应用', type: 'purple' }
      ],
      description_full: '基于AR技术的校园导航系统，提供实时路线规划和校园信息查询功能，帮助新生和访客快速熟悉校园环境。该项目结合了AR增强现实技术与校园地图数据，可以为用户提供沉浸式的导航体验。\n\n系统主要功能包括：实时导航、校园地标识别、信息查询、AR实景引导等。项目已获得学校创新创业基金支持，计划在2025年第三季度完成MVP版本，并在下学期进行校内测试。',
      achievements: '1. 完成了基础地图数据的收集和整理\n2. 开发了AR导航的核心算法\n3. 设计了用户友好的界面原型\n4. 获得了校级创新项目立项',
      teamMembers: [
        { name: '张三', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/f3cdb7f93475495b8eff87a7657acad4.png' },
        { name: '李四', role: 'AR开发工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/d7e2c603cc9b4c0186d2b58b7814f209.png' },
        { name: '赵六', role: '后端开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/63dd5c18e6bc4e2ab9fc7a4355da0837.png' },
        { name: '钱七', role: '产品经理', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/2e30989de7514893a2f0a8cf9df14b70.png' }
      ]
    },
    {
      id: 2,
      title: '校园二手交易平台',
      description: '面向在校学生的二手物品交易平台，支持物品发布、搜索、交易和评价，促进校园资源循环利用。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '已完成',
      statusClass: 'completed',
      type: '创业项目',
      startDate: '2025-02-20',
      teamSize: 4,
      progress: '已上线运营',
      category: '创新创业',
      tags: [
        { text: '创业项目', type: 'green' },
        { text: '微信小程序', type: 'yellow' }
      ],
      description_full: '面向在校学生的二手物品交易平台，支持物品发布、搜索、交易和评价，促进校园资源循环利用。平台包括微信小程序和网页版，实现了校内闲置物品的高效流通。\n\n该项目在2025年初获得了校园创业大赛一等奖，目前已在3所高校试运行，月活跃用户超过5000人，累计完成交易1.2万笔，交易总额超过30万元。',
      achievements: '1. 获得校园创业大赛一等奖\n2. 三个月内完成产品从0到1的开发\n3. 平台月活跃用户超过5000人\n4. 获得天使轮投资20万元',
      teamMembers: [
        { name: '赵明', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/0f2e6dd7500744f9adab3c0370c4b7ff.jpg' },
        { name: '钱亮', role: '前端开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/4fc4474eb7e944d4a037abf33653d2bb.png' },
        { name: '孙芳', role: '产品设计', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/b0bb4cf070944d25b38c5163aab6e0d7.png' },
        { name: '李强', role: '市场运营', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/2c0c6cd9d4c44711864f8dd5dac9bd03.png' }
      ]
    },
    {
      id: 3,
      title: '智慧教室管理系统',
      description: '结合物联网技术的智能教室管理系统，实现教室设备远程控制、使用情况监控和智能预约功能。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '智能硬件',
      startDate: '2025-03-01',
      teamSize: 6,
      progress: '系统测试阶段',
      category: '研究项目',
      tags: [
        { text: '物联网', type: 'blue' },
        { text: '智能硬件', type: 'red' }
      ],
      description_full: '结合物联网技术的智能教室管理系统，实现教室设备远程控制、使用情况监控和智能预约功能。该系统使用了最新的5G物联网技术和边缘计算架构，可以实现教室环境的智能化管理。\n\n系统包括硬件控制模块、数据采集分析模块和用户交互界面，实现了教室照明、空调、多媒体设备的远程控制和自动化调节，并提供了教室使用数据的可视化分析功能。',
      achievements: '1. 完成了系统架构设计和原型开发\n2. 在5个教室进行了试点安装\n3. 开发了移动端和Web端控制界面\n4. 获得了学校信息化建设专项资金支持',
      teamMembers: [
        { name: '周华', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/783a43969651464986b06537792a3474.png' },
        { name: '吴杰', role: '硬件工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/5eab6092472f48559c5f97d0c5f056f2.png' },
        { name: '郑阳', role: '软件开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/6d94aa83cfc8475d8bb0aa3d8dba9928.png' },
        { name: '王梅', role: '界面设计', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/9b41dba52a4440aab8520f6ecf2b5ba7.png' },
        { name: '刘星', role: '系统架构师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/313cf10c0f0e4949b29d0c6981a9b72b.png' },
        { name: '陈亮', role: '测试工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/9ca105ebe429473faebca9c81b8e6f78.png' }
      ]
    },
    {
      id: 4,
      title: '校园文化数字展示平台',
      description: '结合VR技术的校园文化数字展示平台，让用户能够沉浸式体验校园历史、文化景点和重要活动。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '数字文创',
      startDate: '2025-01-10',
      teamSize: 5,
      progress: '功能开发阶段',
      category: '设计作品',
      tags: [
        { text: 'VR技术', type: 'purple' },
        { text: '文化创意', type: 'green' }
      ],
      description_full: '结合VR技术的校园文化数字展示平台，让用户能够沉浸式体验校园历史、文化景点和重要活动。该项目采用了最新的Unity引擎和WebXR技术，可以在网页端和VR设备上运行。\n\n平台内容包括校史馆数字复刻、校园全景漫游、文化活动数字化展示等模块，为校友、新生和访客提供了全新的校园文化体验方式。',
      achievements: '1. 完成了校史馆数字化建模\n2. 开发了VR交互系统\n3. 获得了校园文化建设专项资金\n4. 与校史馆达成合作意向',
      teamMembers: [
        { name: '林小燕', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/8d03efc18b60458f81d70790db65dfb2.jpg' },
        { name: '张文轩', role: '3D建模师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/0a8bb3eb0b144eb1bf027e44dcffd85c.png' },
        { name: '王丽丽', role: 'Unity开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/e71bf50a98ec42079b9746bbd982e405.png' },
        { name: '李明明', role: 'UI设计师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/f105b7539d5a4dd6a4b3c0bbd3124057.jpeg' },
        { name: '赵天成', role: '内容策划', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/056214c9ae354676a40a0b965dd39acc.jpeg' }
      ]
    },
    {
      id: 5,
      title: '智能化学实验助手',
      description: '基于计算机视觉的智能化学实验助手，通过摄像头实时识别实验操作，提供步骤提示和安全警告。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '已完成',
      statusClass: 'completed',
      type: '科研项目',
      startDate: '2024-11-05',
      teamSize: 4,
      progress: '已投入使用',
      category: '科技竞赛',
      tags: [
        { text: '人工智能', type: 'blue' },
        { text: '教育科技', type: 'green' }
      ],
      description_full: '基于计算机视觉的智能化学实验助手，通过摄像头实时识别实验操作，提供步骤提示和安全警告。该系统采用最新的深度学习算法，能够识别超过50种常见化学实验操作和100种试剂。\n\n系统包括实验识别模块、实验指导模块和安全监控模块，可以为学生提供实时的实验指导，同时监测危险操作并发出警告，大幅提高了实验的安全性和教学效果。',
      achievements: '1. 获得全国大学生人工智能创新大赛特等奖\n2. 实现了对50+种化学实验操作的精准识别\n3. 在学校3个化学实验室完成部署\n4. 申请专利2项，软件著作权1项',
      teamMembers: [
        { name: '刘博', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/fa539323f8304e5885a7a454ef468849.jpeg' },
        { name: '张丽丽', role: '算法工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/6a89448ba5f04d67b2d753f6bcdddef8.jpeg' },
        { name: '王明', role: '软件开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/3900eb55be7c4cb3b17c0b02d07a18bc.png' },
        { name: '李华', role: '化学顾问', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/f3cdb7f93475495b8eff87a7657acad4.png' }
      ]
    },
    {
      id: 6,
      title: '校园碳排放监测系统',
      description: '基于物联网的校园碳排放监测系统，通过传感器网络实时收集和分析校园各区域的能源消耗和碳排放数据。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '可持续发展',
      startDate: '2025-02-28',
      teamSize: 7,
      progress: '数据分析阶段',
      category: '研究项目',
      tags: [
        { text: '环保科技', type: 'green' },
        { text: '大数据', type: 'blue' }
      ],
      description_full: '基于物联网的校园碳排放监测系统，通过传感器网络实时收集和分析校园各区域的能源消耗和碳排放数据。系统采用了低功耗广域网技术(LoRaWAN)和边缘计算架构，建立了覆盖全校区的监测网络。\n\n项目目标是构建校园碳排放数据地图，通过数据分析发现节能减排的潜力点，为学校实现"双碳"目标提供数据支持和技术方案。',
      achievements: '1. 完成了全校20个重点区域的传感器部署\n2. 建立了碳排放数据分析模型\n3. 开发了实时监测平台和可视化界面\n4. 获得了省级绿色校园建设专项资金',
      teamMembers: [
        { name: '李江', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/d7e2c603cc9b4c0186d2b58b7814f209.png' },
        { name: '张雨', role: '硬件工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/63dd5c18e6bc4e2ab9fc7a4355da0837.png' },
        { name: '王磊', role: '数据分析师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/2e30989de7514893a2f0a8cf9df14b70.png' },
        { name: '刘芳', role: '软件开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/0f2e6dd7500744f9adab3c0370c4b7ff.jpg' },
        { name: '赵明', role: '环境工程顾问', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/4fc4474eb7e944d4a037abf33653d2bb.png' },
        { name: '钱亮', role: '系统架构师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/b0bb4cf070944d25b38c5163aab6e0d7.png' },
        { name: '孙华', role: '前端开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/2c0c6cd9d4c44711864f8dd5dac9bd03.png' }
      ]
    },
    {
      id: 7,
      title: '校园智能健康助手',
      description: '结合可穿戴设备的校园智能健康助手，为学生提供运动追踪、健康监测和个性化健康建议。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '健康科技',
      startDate: '2025-04-01',
      teamSize: 5,
      progress: '用户测试阶段',
      category: '创新创业',
      tags: [
        { text: '健康医疗', type: 'red' },
        { text: '移动应用', type: 'blue' }
      ],
      description_full: '结合可穿戴设备的校园智能健康助手，为学生提供运动追踪、健康监测和个性化健康建议。项目包括移动应用和云平台两部分，支持主流智能手环和手表的数据接入。\n\n系统结合了运动科学和营养学知识，针对大学生群体特点，提供科学的运动计划和饮食建议，同时通过社交功能激励学生养成健康的生活习惯。',
      achievements: '1. 完成了移动应用开发和云平台搭建\n2. 对接了5种主流可穿戴设备的数据\n3. 招募了200名学生进行封闭测试\n4. 获得了校医院的专业支持和合作',
      teamMembers: [
        { name: '陈健', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/783a43969651464986b06537792a3474.png' },
        { name: '李明', role: '移动开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/5eab6092472f48559c5f97d0c5f056f2.png' },
        { name: '王芳', role: '产品经理', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/6d94aa83cfc8475d8bb0aa3d8dba9928.png' },
        { name: '张强', role: '后端开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/9b41dba52a4440aab8520f6ecf2b5ba7.png' },
        { name: '刘伟', role: '健康顾问', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/313cf10c0f0e4949b29d0c6981a9b72b.png' }
      ]
    },
    {
      id: 8,
      title: '智能垃圾分类系统',
      description: '基于计算机视觉和机器学习的智能垃圾分类系统，能自动识别垃圾类型并引导用户进行正确分类。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '已完成',
      statusClass: 'completed',
      type: '环保科技',
      startDate: '2024-09-15',
      teamSize: 4,
      progress: '已投入使用',
      category: '科技竞赛',
      tags: [
        { text: '人工智能', type: 'blue' },
        { text: '环保项目', type: 'green' }
      ],
      description_full: '基于计算机视觉和机器学习的智能垃圾分类系统，能自动识别垃圾类型并引导用户进行正确分类。系统采用了轻量级深度学习模型，可在普通智能手机上运行，识别准确率达95%以上。\n\n项目开发了移动应用和智能垃圾桶两种应用形式，已在校园内部署了20个智能垃圾分类点，显著提高了校园垃圾分类的准确率和参与度。',
      achievements: '1. 获得全国大学生环保创新大赛一等奖\n2. 垃圾识别准确率超过95%\n3. 校园内部署20个智能垃圾分类点\n4. 申请专利1项，软件著作权2项',
      teamMembers: [
        { name: '李环', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/9ca105ebe429473faebca9c81b8e6f78.png' },
        { name: '王晓', role: '算法工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/8d03efc18b60458f81d70790db65dfb2.jpg' },
        { name: '张鑫', role: '硬件开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/0a8bb3eb0b144eb1bf027e44dcffd85c.png' },
        { name: '刘芳', role: '软件开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/e71bf50a98ec42079b9746bbd982e405.png' }
      ]
    },
    {
      id: 9,
      title: '校园文创IP设计',
      description: '基于校园文化元素的创意设计项目，包括吉祥物、插画、表情包等系列文创产品设计。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '已完成',
      statusClass: 'completed',
      type: '文化创意',
      startDate: '2025-01-20',
      teamSize: 3,
      progress: '成果展示阶段',
      category: '设计作品',
      tags: [
        { text: '文创设计', type: 'purple' },
        { text: '品牌IP', type: 'yellow' }
      ],
      description_full: '基于校园文化元素的创意设计项目，包括吉祥物、插画、表情包等系列文创产品设计。项目以学校的历史、建筑、文化符号为创作灵感，设计了一系列具有校园特色的文创IP。\n\n成果包括校园吉祥物"知园宝"及其延伸表情包、校园建筑插画集、纪念品设计等，已在校内文创店上架销售，并在校庆期间推出限定系列。',
      achievements: '1. 设计了校园吉祥物及40款表情包\n2. 完成12幅校园建筑插画创作\n3. 开发了20款文创产品并投入生产\n4. 校庆期间销售额突破5万元',
      teamMembers: [
        { name: '王艺', role: '项目负责人/设计师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/f105b7539d5a4dd6a4b3c0bbd3124057.jpeg' },
        { name: '李梦', role: '插画师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/056214c9ae354676a40a0b965dd39acc.jpeg' },
        { name: '张晓', role: '产品设计', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/fa539323f8304e5885a7a454ef468849.jpeg' }
      ]
    },
    {
      id: 10,
      title: '智能课程推荐系统',
      description: '基于大数据和深度学习的个性化课程推荐系统，根据学生的学习历史、兴趣偏好和发展规划推荐适合的课程。',
      coverImage: '/static/image/placeholder.jpg',
      statusText: '进行中',
      statusClass: 'ongoing',
      type: '教育科技',
      startDate: '2025-03-10',
      teamSize: 5,
      progress: '算法优化阶段',
      category: '研究项目',
      tags: [
        { text: '机器学习', type: 'blue' },
        { text: '教育科技', type: 'green' }
      ],
      description_full: '基于大数据和深度学习的个性化课程推荐系统，根据学生的学习历史、兴趣偏好和发展规划推荐适合的课程。系统采用了最新的深度学习和协同过滤算法，整合了学校5年的选课数据和课程评价数据。\n\n项目目标是解决学生选课难、选课盲目等问题，提供个性化的课程推荐和学习路径规划，帮助学生更科学地规划学业。',
      achievements: '1. 完成了课程数据库的构建和清洗\n2. 开发了基础推荐算法和用户界面\n3. 在部分学院进行了试点测试\n4. 收集了超过1万条用户反馈数据',
      teamMembers: [
        { name: '张智', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/6a89448ba5f04d67b2d753f6bcdddef8.jpeg' },
        { name: '李数', role: '算法工程师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/3900eb55be7c4cb3b17c0b02d07a18bc.png' },
        { name: '王研', role: '数据分析师', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/f3cdb7f93475495b8eff87a7657acad4.png' },
        { name: '刘程', role: '全栈开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/d7e2c603cc9b4c0186d2b58b7814f209.png' },
        { name: '赵美', role: '产品经理', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/63dd5c18e6bc4e2ab9fc7a4355da0837.png' }
      ]
    }
  ];

  // 查找对应ID的项目
  const found = projectsData.find(item => item.id === Number(id));
  if (found) {
    project.value = found;
    loading.value = false;
  } else {
    uni.showToast({
      title: '项目不存在',
      icon: 'none'
    });

  }
}


// 页面加载时获取项目ID
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options;
  
  if (options && options.id) {
    projectId.value = options.id;
    getProjectDetail(options.id);
  } else {
    uni.showToast({
      title: '项目ID不存在',
      icon: 'none'
    });

  }
});

// 返回上一页
function goBack() {
  uni.navigateBack({
    delta: 1
  });
}

// 分享项目
function shareProject() {
  uni.showToast({
    title: '分享功能暂未开放',
    icon: 'none'
  });
}

// 申请加入项目
function joinProject() {
  uni.showToast({
    title: '已发送申请',
    icon: 'success'
  });
}
</script>

<style lang="scss">
@import '@/config/theme.scss';

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
}

.content-scroll {
  flex: 1;
  margin-top: 120rpx; /* 为顶部导航栏留出空间 */
  padding-bottom: 180rpx; /* 为底部操作栏留出空间 */
}

/* 项目封面 */
.project-cover {
  position: relative;
  height: 400rpx;
  width: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.status-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: white;
  z-index: 10;
  
  &.status-ongoing {
    background-color: $primary-color;
  }
  
  &.status-completed {
    background-color: $success-color;
  }
}

/* 项目信息卡片 */
.project-info-card {
  margin: 0 30rpx;
  padding: 32rpx;
  background-color: #fff;
  border-radius: 24rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 20;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.project-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}

.tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  
  &.tag-blue {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &.tag-purple {
    background-color: rgba(#9C27B0, 0.1);
    color: #9C27B0;
  }
  
  &.tag-green {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
  
  &.tag-yellow {
    background-color: rgba(#FFC107, 0.1);
    color: #FFC107;
  }
  
  &.tag-red {
    background-color: rgba($danger-color, 0.1);
    color: $danger-color;
  }
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-top: 32rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 24rpx;
  color: $text-muted;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: $text-color;
  font-weight: 500;
}

/* 内容卡片 */
.section-card {
  margin: 30rpx;
  padding: 32rpx;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 20rpx;
  position: relative;
  padding-left: 24rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6rpx;
    width: 8rpx;
    height: 32rpx;
    background-color: $primary-color;
    border-radius: 4rpx;
  }
}

.section-content {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
  white-space: pre-line;
}

/* 图片画廊 */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 24rpx;
}

.gallery-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

/* 团队成员 */
.team-members {
  margin-top: 20rpx;
}

.member-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 28rpx;
  color: $text-color;
  font-weight: 500;
}

.member-role {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 4rpx;
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  /* 适配底部安全区域 */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom, 0));
}

.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  
  text {
    font-size: 24rpx;
    color: $text-secondary;
    margin-top: 8rpx;
  }
}

.primary-btn {
  flex: 1;
  background-color: $primary-color;
  color: #fff;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}
</style> 