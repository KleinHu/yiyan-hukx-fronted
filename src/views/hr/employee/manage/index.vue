<template>
  <div class="employee-management-container">
    <div class="page-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>员工管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <a-row :gutter="16" class="management-layout">
      <!-- 左侧：人员导航与筛选 -->
      <a-col :span="6" class="left-col">
        <a-card :bordered="false" class="panel-card left-panel-card">
          <div class="left-panel">
            <div class="panel-header">
              <div class="header-top">
                <span class="header-title">员工名录</span>
                <a-button type="primary" size="mini" @click="handleAdd">
                  <template #icon><icon-plus /></template>新增
                </a-button>
              </div>
              <a-space direction="vertical" fill :size="10" class="filter-area">
                <a-input-search
                  v-model="searchKey"
                  placeholder="搜索姓名/工号"
                  allow-clear
                  @search="fetchData"
                />
                <a-select
                  v-model="filterDept"
                  placeholder="按科室筛选"
                  allow-clear
                  @change="fetchData"
                >
                  <a-option
                    v-for="dept in departmentList"
                    :key="dept.deptId"
                    :value="dept.deptId"
                  >
                    {{ dept.deptName }}
                  </a-option>
                </a-select>
              </a-space>
            </div>

            <div class="list-wrapper">
              <a-spin :loading="loading" style="width: 100%">
                <div
                  v-for="item in employeeList"
                  :key="item.userCode"
                  :class="[
                    'employee-nav-card',
                    { active: currentRecord?.userCode === item.userCode },
                  ]"
                  @click="handleSelect(item)"
                >
                  <div class="card-avatar">
                    <a-avatar
                      :size="36"
                      :style="{ backgroundColor: '#165DFF' }"
                    >
                      {{ item.userName?.charAt(0) }}
                    </a-avatar>
                  </div>
                  <div class="card-content">
                    <div class="card-row-top">
                      <span class="name">{{ item.userName }}</span>
                      <a-tag
                        size="small"
                        :status="getStatusType(item.status)"
                        >{{
                          item.statusName || getStatusLabel(item.status)
                        }}</a-tag
                      >
                    </div>
                    <div class="card-row-bottom">
                      <span class="dept">{{
                        item.departmentName || '未分配'
                      }}</span>
                      <span class="code">{{ item.userCode }}</span>
                    </div>
                  </div>
                </div>
                <a-empty
                  v-if="!employeeList.length || employeeList.length === 0"
                />
              </a-spin>
            </div>

            <div class="panel-footer">
              <a-pagination
                v-model:current="pagination.current"
                size="mini"
                :total="pagination.total"
                simple
                @change="fetchData"
              />
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧：详情面板 -->
      <a-col :span="18" class="right-col">
        <a-card :bordered="false" class="panel-card right-panel-card">
          <a-spin :loading="detailLoading" style="width: 100%; height: 100%">
            <div v-if="currentRecord || isAdding" class="right-panel">
              <div class="detail-header-sticky">
                <div class="person-summary">
                  <a-avatar :size="54" class="header-avatar">
                    {{ formData.userName?.charAt(0) }}
                  </a-avatar>
                  <div class="info">
                    <div class="main">
                      <span class="name">{{
                        isAdding ? '新进员工录入' : formData.userName
                      }}</span>
                      <span v-if="!isAdding" class="code">{{
                        formData.userCode
                      }}</span>
                    </div>
                    <div class="sub">
                      {{ formData.departmentName || '待定科室' }} ·
                      {{ formData.jobTitle || '待定职位' }}
                    </div>
                  </div>
                </div>
                <a-space>
                  <a-button @click="handleCancel">
                    {{ isAdding ? '取消新增' : '取消修改' }}
                  </a-button>
                  <a-button
                    type="primary"
                    :loading="submitLoading"
                    @click="handleSave"
                  >
                    <template #icon><icon-save /></template>提交保存
                  </a-button>
                </a-space>
              </div>

              <div class="scroll-form-container">
                <a-form
                  ref="formRef"
                  :model="formData"
                  :rules="rules"
                  layout="vertical"
                  class="full-width-form"
                >
                  <a-row :gutter="24">
                    <!-- 第一部分：基本身份（Employee表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-idcard /> 核心身份信息
                          </div>
                        </template>
                        <div class="identity-content-layout">
                          <div class="photo-area">
                            <a-form-item label="员工证件照 (2寸)">
                              <a-space direction="vertical">
                                <div
                                  class="id-card-uploader"
                                  @click="handleOpenPhotoEditor"
                                >
                                  <img
                                    v-if="formData.avatarUrl"
                                    :src="formData.avatarUrl"
                                    class="id-photo"
                                  />
                                  <div v-else class="upload-placeholder">
                                    <icon-plus />
                                    <div class="text">点击上传</div>
                                  </div>
                                  <div class="upload-mask">
                                    <icon-camera />
                                    <span>{{
                                      formData.avatarUrl
                                        ? '更换照片'
                                        : '上传照片'
                                    }}</span>
                                  </div>
                                </div>
                                <div class="photo-tip">建议比例 3:4</div>
                              </a-space>
                            </a-form-item>
                          </div>
                          <div class="fields-area">
                            <a-row :gutter="16">
                              <a-col :span="12">
                                <a-form-item
                                  field="userCode"
                                  label="工号"
                                  required
                                >
                                  <a-input
                                    v-model="formData.userCode"
                                    :disabled="!isAdding"
                                    placeholder="E-XXX"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item
                                  field="userName"
                                  label="姓名"
                                  required
                                >
                                  <a-input
                                    v-model="formData.userName"
                                    placeholder="请输入姓名"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item field="gender" label="性别">
                                  <a-radio-group
                                    v-model="formData.gender"
                                    type="button"
                                  >
                                    <a-radio :value="1">男</a-radio>
                                    <a-radio :value="2">女</a-radio>
                                  </a-radio-group>
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item field="idCardNo" label="身份证号">
                                  <a-input
                                    v-model="formData.idCardNo"
                                    placeholder="18位身份证号"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item field="birthDate" label="出生日期">
                                  <a-date-picker
                                    v-model="formData.birthDate"
                                    style="width: 100%"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item field="mobile" label="联系电话">
                                  <a-input
                                    v-model="formData.mobile"
                                    placeholder="手机号"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item field="email" label="企业邮箱">
                                  <a-input
                                    v-model="formData.email"
                                    placeholder="xxx@company.com"
                                  />
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item
                                  field="maritalStatus"
                                  label="婚姻状况"
                                >
                                  <a-select v-model="formData.maritalStatus">
                                    <a-option :value="1">未婚</a-option>
                                    <a-option :value="2">已婚</a-option>
                                    <a-option :value="3">离异</a-option>
                                    <a-option :value="4">丧偶</a-option>
                                  </a-select>
                                </a-form-item>
                              </a-col>
                              <a-col :span="12">
                                <a-form-item
                                  field="politicalStatus"
                                  label="政治面貌"
                                >
                                  <a-select v-model="formData.politicalStatus">
                                    <a-option
                                      v-for="opt in PoliticalStatusOptions"
                                      :key="opt.value"
                                      :value="opt.value"
                                    >
                                      {{ opt.label }}
                                    </a-option>
                                  </a-select>
                                </a-form-item>
                              </a-col>
                            </a-row>
                          </div>
                        </div>
                      </a-card>
                    </a-col>

                    <!-- 第二部分：岗位分配（Positions表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-user-group /> 行政岗位配置
                          </div>
                        </template>
                        <a-row :gutter="16">
                          <a-col :span="12">
                            <a-form-item
                              field="departmentId"
                              label="所属科室/部门"
                              required
                            >
                              <a-tree-select
                                v-model="formData.departmentId"
                                :data="departmentTreeData"
                                placeholder="请选择科室/部门"
                                :field-names="{
                                  key: 'deptId',
                                  title: 'deptName',
                                  children: 'children',
                                }"
                                allow-clear
                                allow-search
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item field="jobTitle" label="岗位">
                              <a-input
                                v-model="formData.jobTitle"
                                placeholder="请输入岗位名称"
                                allow-clear
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item field="rankId" label="公司职级">
                              <a-select
                                v-model="formData.rankId"
                                placeholder="选择职级（如：员、师）"
                              >
                                <a-option
                                  v-for="rank in jobRankList"
                                  :key="rank.rankId"
                                  :value="rank.rankId"
                                  >{{ rank.rankName }}</a-option
                                >
                              </a-select>
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item
                              field="professionalTitleId"
                              label="专业职称"
                            >
                              <a-select
                                v-model="formData.professionalTitleId"
                                placeholder="选择职称（如：工程师）"
                                allow-clear
                                @change="handleTitleChange"
                              >
                                <a-option
                                  v-for="title in professionalTitleList"
                                  :key="title.titleId"
                                  :value="title.titleId"
                                  >{{ title.titleName }}</a-option
                                >
                              </a-select>
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item field="status" label="在职状态">
                              <a-select v-model="formData.status">
                                <a-option
                                  v-for="item in EmployeeStatusOptions"
                                  :key="item.value"
                                  :value="item.value"
                                  >{{ item.label }}</a-option
                                >
                              </a-select>
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item field="hireDate" label="入职日期">
                              <a-date-picker
                                v-model="formData.hireDate"
                                style="width: 100%"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item
                              field="transferDate"
                              label="调入厂日期"
                            >
                              <a-date-picker
                                v-model="formData.transferDate"
                                style="width: 100%"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="24">
                            <a-form-item
                              field="officeLocation"
                              label="办公具体位置"
                            >
                              <a-input
                                v-model="formData.officeLocation"
                                placeholder="如：101B楼2层222室"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="24">
                            <a-form-item label="特殊身份">
                              <a-space>
                                <a-checkbox v-model="formData.isRepresentative"
                                  >职工代表</a-checkbox
                                >
                                <a-checkbox v-model="formData.isTeamLeader"
                                  >工组长</a-checkbox
                                >
                              </a-space>
                            </a-form-item>
                          </a-col>
                        </a-row>
                      </a-card>
                    </a-col>

                    <!-- 新增部分：核心岗位详细信息（Positions表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-apps /> 核心岗位详细信息
                          </div>
                        </template>
                        <a-row :gutter="16">
                          <a-col :span="12">
                            <a-form-item label="一级专业">
                              <a-input
                                v-model="extData.position.primaryProfession"
                                placeholder="请输入一级专业"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="二级专业">
                              <a-input
                                v-model="extData.position.secondaryProfession"
                                placeholder="请输入二级专业"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="岗位分类">
                              <a-input
                                v-model="extData.position.jobCategory"
                                placeholder="请输入岗位分类"
                              />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="岗位序列">
                              <a-input
                                v-model="extData.position.positionType"
                                placeholder="请输入岗位序列"
                              />
                            </a-form-item>
                          </a-col>
                        </a-row>
                      </a-card>
                    </a-col>

                    <!-- 第三部分：教育背景（Education表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title"><icon-book /> 教育背景</div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="educationListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增教育经历
                          </a-button>
                        </template>
                        <employee-education-list
                          ref="educationListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`edu-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第四部分：技能与鉴定（Skill/Cert表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-skin /> 技能鉴定与证书
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="skillsListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增技能鉴定
                          </a-button>
                        </template>
                        <employee-skills-list
                          ref="skillsListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`skill-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第五部分：社会关系（Contact表） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-phone /> 紧急联系人
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="contactsListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template
                            >新增紧急联系人
                          </a-button>
                        </template>
                        <employee-contacts-list
                          ref="contactsListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`contact-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第六部分：绩效记录与职级历史 -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title"><icon-star /> 绩效记录</div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="performanceListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增绩效记录
                          </a-button>
                        </template>
                        <employee-performance-list
                          ref="performanceListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`perf-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-layers /> 职级历史
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="rankTimelineRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增职级变动
                          </a-button>
                        </template>
                        <employee-rank-timeline
                          ref="rankTimelineRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`rank-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第七部分：岗位师傅（带教关系） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-user-group /> 岗位师傅
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="mentorsListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增带教记录
                          </a-button>
                        </template>
                        <employee-mentors-list
                          ref="mentorsListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`mentor-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第八部分：授课认证 -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-trophy /> 授课认证
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="teachingCertListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增授课认证
                          </a-button>
                        </template>
                        <employee-teaching-cert-list
                          ref="teachingCertListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`tcert-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第九部分：授课认定 -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title">
                            <icon-check-circle /> 授课认定
                          </div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="teachingRecordListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增授课认定
                          </a-button>
                        </template>
                        <employee-teaching-record-list
                          ref="teachingRecordListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`trecord-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第十部分：二级教育（EHS/安全/保密） -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title"><icon-safe /> 二级教育</div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="secondaryEduListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增二级教育
                          </a-button>
                        </template>
                        <employee-secondary-edu-list
                          ref="secondaryEduListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`sedu-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第十一部分：荣誉情况 -->
                    <a-col :span="12">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title"><icon-gift /> 荣誉情况</div>
                        </template>
                        <template #extra>
                          <a-button
                            type="primary"
                            size="mini"
                            @click="honorsListRef?.handleAdd?.()"
                          >
                            <template #icon><icon-plus /></template>新增荣誉记录
                          </a-button>
                        </template>
                        <employee-honors-list
                          ref="honorsListRef"
                          :user-code="formData.userCode || ''"
                          :is-new-mode="isAdding"
                          hide-header
                          :key="`honor-${formData.userCode || 'new'}`"
                        />
                      </a-card>
                    </a-col>

                    <!-- 第十二部分：其他备注 -->
                    <a-col :span="24">
                      <a-card :bordered="false" class="form-block">
                        <template #title>
                          <div class="block-title"><icon-edit /> 综合备注</div>
                        </template>
                        <a-form-item hide-label>
                          <a-textarea
                            v-model="formData.remark"
                            :rows="3"
                            placeholder="请输入其他需要说明的人事档案信息..."
                            allow-clear
                          />
                        </a-form-item>
                      </a-card>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            </div>
            <div v-else class="empty-detail">
              <div class="empty-content">
                <icon-user :size="80" />
                <h3>人事管理工作台</h3>
                <p>请在左侧名录中选择员工，或点击“新增”按钮录入新成员档案</p>
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>

    <!-- 证件照编辑器模态框 -->
    <IdPhoto
      v-model:visible="photoEditorVisible"
      title="编辑证件照"
      :show-download="false"
      @complete="handlePhotoEditorComplete"
      @cancel="handlePhotoEditorCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import employeeApi from '@/api/hr/employee';
  import departmentApi from '@/api/hr/department';
  import jobRankApi from '@/api/hr/job-rank';
  import professionalTitleApi from '@/api/hr/professional-title';
  import employeeRecordApi from '@/api/hr/records';
  import fileApi from '@/api/hr/file';
  import type {
    Employee,
    Department,
    JobRank,
    Position,
    ProfessionalTitle,
  } from '@/api/hr/types';
  import {
    EmployeeStatusOptions,
    PoliticalStatusOptions,
  } from '@/api/hr/types';
  import IdPhoto from '@/components/id-photo/index.vue';
  import EmployeePerformanceList from '../common/employee-performance-list.vue';
  import EmployeeRankTimeline from '../common/employee-rank-timeline.vue';
  import EmployeeSkillsList from '../common/employee-skills-list.vue';
  import EmployeeContactsList from '../common/employee-contacts-list.vue';
  import EmployeeEducationList from '../common/employee-education-list.vue';
  import EmployeeMentorsList from '../common/employee-mentors-list.vue';
  import EmployeeTeachingCertList from '../common/employee-teaching-cert-list.vue';
  import EmployeeTeachingRecordList from '../common/employee-teaching-record-list.vue';
  import EmployeeSecondaryEduList from '../common/employee-secondary-edu-list.vue';
  import EmployeeHonorsList from '../common/employee-honors-list.vue';

  // 状态
  const loading = ref(false);
  const detailLoading = ref(false);
  const submitLoading = ref(false);
  const employeeList = ref<Employee[]>([]);
  const departmentList = ref<Department[]>([]);
  const departmentTreeData = ref<any[]>([]);
  const jobRankList = ref<JobRank[]>([]);
  const professionalTitleList = ref<ProfessionalTitle[]>([]);
  const searchKey = ref('');
  const filterDept = ref<string | undefined>(undefined);
  const currentRecord = ref<Employee | null>(null);
  const isAdding = ref(false);
  const photoEditorVisible = ref(false);
  const formRef = ref();

  // 子组件引用（用于新建模式下批量保存）
  const educationListRef = ref();
  const skillsListRef = ref();
  const contactsListRef = ref();
  const performanceListRef = ref();
  const rankTimelineRef = ref();
  const mentorsListRef = ref();
  const teachingCertListRef = ref();
  const teachingRecordListRef = ref();
  const secondaryEduListRef = ref();
  const honorsListRef = ref();

  // 校验规则
  const rules = {
    userCode: [{ required: true, message: '工号为必填项' }],
    userName: [{ required: true, message: '姓名为必填项' }],
    departmentId: [{ required: true, message: '所属部门为必选项' }],
    mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }],
    // email: [{ type: 'email', message: '邮箱格式不正确' }],
    idCardNo: [
      {
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        message: '身份证格式不正确',
      },
    ],
  };

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 档案主表数据
  const formData = reactive<Partial<Employee>>({});

  // 档案扩展数据
  const extData = reactive({
    position: {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    } as Partial<Position>,
  });

  const getStatusType = (status?: number) => {
    switch (status) {
      case 1:
        return 'warning';
      case 2:
        return 'success';
      case 3:
        return 'danger';
      default:
        return 'normal';
    }
  };

  const getStatusLabel = (status?: number) => {
    return (
      EmployeeStatusOptions.find((opt) => opt.value === status)?.label || '未知'
    );
  };

  /**
   * 加载名录数据
   */
  const fetchData = async () => {
    try {
      loading.value = true;
      const { data } = await employeeApi.getEmployeePage({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        userName: searchKey.value,
        departmentId: filterDept.value,
      });
      employeeList.value = data.list || [];
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 选择员工
   */
  const handleSelect = async (record: Employee) => {
    isAdding.value = false;
    currentRecord.value = record;
    // 重置并载入数据
    Object.assign(formData, JSON.parse(JSON.stringify(record)));

    // 载入扩展数据
    resetExtData();
    if (record.userCode) {
      try {
        detailLoading.value = true;
        const posRes = await employeeRecordApi.getPosition(record.userCode);
        if (posRes.code === 200 && posRes.data) {
          extData.position = { ...posRes.data };
        }
      } catch (e) {
        // 获取岗位详细信息失败，静默处理
      } finally {
        detailLoading.value = false;
      }
    }
  };

  /**
   * 点击新增
   */
  const handleAdd = () => {
    isAdding.value = true;
    currentRecord.value = null;
    // 清空表单，设置默认值
    Object.keys(formData).forEach((key) => delete (formData as any)[key]);
    formData.gender = 1;
    formData.status = 1;
    formData.politicalStatus = 3; // 默认群众
    resetExtData();
  };

  const resetExtData = () => {
    extData.position = {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    };
  };

  /**
   * 职称变更时，同步更新职称名称
   */
  const handleTitleChange = (titleId: string) => {
    const selectedTitle = professionalTitleList.value.find(
      (t) => t.titleId === titleId
    );
    formData.professionalTitleName = selectedTitle?.titleName || '';
  };

  const handleCancel = () => {
    isAdding.value = false;
    currentRecord.value = null;
  };

  /**
   * 上传头像逻辑
   */
  //   const triggerUpload = () => {
  //     // a-upload 内置了点击触发，这里主要作为容器层，不需要额外逻辑
  //   };

  // 打开照片编辑器
  const handleOpenPhotoEditor = () => {
    photoEditorVisible.value = true;
  };

  // 照片编辑器完成
  const handlePhotoEditorComplete = async (data: {
    base64: string;
    file: File;
  }) => {
    try {
      const { data: uploadResult } = await fileApi.uploadFile(
        data.file,
        'avatar'
      );
      if (uploadResult?.url) {
        formData.avatarUrl = uploadResult.url;
        Message.success('证件照上传成功，保存后生效');
      }
    } catch (e) {
      Message.error('证件照上传失败');
    } finally {
      photoEditorVisible.value = false;
    }
  };

  // 照片编辑器取消
  const handlePhotoEditorCancel = () => {
    photoEditorVisible.value = false;
  };

  // 保留原有的上传方法（兼容性）
  // const onAvatarUpload = async (options: any) => {
  //   const { fileItem } = options;
  //   try {
  //     const { data } = await fileApi.uploadFile(fileItem.file, 'avatar');
  //     if (data?.url) {
  //       formData.avatarUrl = data.url;
  //       Message.success('头像上传成功，保存后生效');
  //     }
  //   } catch (e) {
  //     Message.error('头像上传失败');
  //   }
  // };

  /**
   * 保存档案
   */
  const handleSave = async () => {
    const errors = await formRef.value?.validate();
    if (errors) {
      Message.error('表单填写有误，请检查');
      return;
    }

    try {
      submitLoading.value = true;
      // 1. 保存主表数据
      if (isAdding.value) {
        await employeeApi.createEmployee(formData);
      } else {
        if (!formData.userCode) {
          Message.error('工号不能为空');
          return;
        }
        await employeeApi.updateEmployee(formData.userCode, formData);
      }

      const { userCode } = formData;
      if (!userCode) {
        Message.error('工号不能为空');
        return;
      }

      // 2. 保存岗位子表数据
      await employeeRecordApi.savePosition(userCode, extData.position);

      // 3. 如果是新建模式，批量保存所有子表数据
      if (isAdding.value) {
        const saveResults = await Promise.all([
          educationListRef.value?.saveAllData(userCode),
          skillsListRef.value?.saveAllData(userCode),
          contactsListRef.value?.saveAllData(userCode),
          performanceListRef.value?.saveAllData(userCode),
          rankTimelineRef.value?.saveAllData(userCode),
          mentorsListRef.value?.saveAllData(userCode),
          teachingCertListRef.value?.saveAllData(userCode),
          teachingRecordListRef.value?.saveAllData(userCode),
          secondaryEduListRef.value?.saveAllData(userCode),
          honorsListRef.value?.saveAllData(userCode),
        ]);

        const allSuccess = saveResults.every((result) => result !== false);
        if (!allSuccess) {
          Message.warning('部分子表数据保存失败，请检查');
        }
      }

      Message.success('人事档案已全量更新');
      isAdding.value = false;
      fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
    // 获取部门树形结构
    departmentApi.getDepartmentTree().then((res) => {
      departmentTreeData.value = res.data || [];
      // 同时保留扁平列表用于筛选（如果需要）
      departmentApi.getDepartmentList().then((listRes) => {
        departmentList.value = listRes.data || [];
      });
    });
    // 获取职级列表
    jobRankApi.getJobRankList().then((res) => {
      jobRankList.value = res.data || [];
    });
    // 获取专业职称列表
    professionalTitleApi.getProfessionalTitleList().then((res) => {
      professionalTitleList.value = res.data || [];
    });
  });
</script>

<style scoped lang="less">
  .employee-management-container {
    padding: 12px;
    height: calc(100vh - 180px);
    background-color: #f4f7f9;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .page-breadcrumb {
      flex-shrink: 0;
      margin-bottom: 12px;
      padding-left: 4px;
      :deep(.arco-breadcrumb-item) {
        color: #86909c;
        &:last-child {
          color: #1d2129;
          font-weight: 500;
        }
      }
    }

    .management-layout {
      flex: 1;
      min-height: 0;
    }
  }

  .left-col,
  .right-col {
    height: 100%;
  }

  .panel-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    background-color: #fff;

    :deep(.arco-card-body) {
      height: 100%;
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
    }
  }

  // 左侧面板
  .left-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .panel-header {
      padding: 14px 16px;
      background-color: #fff;
      border-bottom: 1px solid #f2f3f5;

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .header-title {
          font-size: 15px;
          font-weight: 600;
          color: #1d2129;
        }
      }

      .filter-area {
        :deep(.arco-select-view) {
          background-color: #f2f3f5;
          border-color: transparent;
        }
        :deep(.arco-input-wrapper) {
          background-color: #f2f3f5;
          border-color: transparent;
        }
      }
    }

    .list-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .employee-nav-card {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #f2f3f5;
        }

        &.active {
          background-color: #e8f3ff;
          .name {
            color: #165dff;
          }
        }

        .card-avatar {
          margin-right: 12px;
        }

        .card-content {
          flex: 1;

          .card-row-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .name {
              font-weight: 500;
              font-size: 14px;
              color: #1d2129;
            }
          }

          .card-row-bottom {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }

    .panel-footer {
      padding: 12px;
      border-top: 1px solid #f2f3f5;
      display: flex;
      justify-content: center;
    }
  }

  // 右侧面板
  .right-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff; // 改回白色背景，因为现在在卡片里了

    .detail-header-sticky {
      padding: 12px 24px;
      background-color: #fff;
      border-bottom: 1px solid #f2f3f5; // 统一边框颜色
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02); // 卡片已有阴影，这里可以淡化

      .person-summary {
        display: flex;
        align-items: center;

        .header-avatar {
          margin-right: 16px;
          border: 2px solid #e8f3ff;
        }

        .info {
          .main {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 2px;

            .name {
              font-size: 18px;
              font-weight: 600;
              color: #1d2129;
            }

            .code {
              font-size: 12px;
              background: #f2f3f5;
              padding: 1px 6px;
              border-radius: 4px;
              color: #4e5969;
            }
          }

          .sub {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }

    .scroll-form-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      background-color: #f7f8fa; // 浅灰色背景，突出表单块

      .full-width-form {
        max-width: 1400px;
        margin: 0 auto;

        :deep(.arco-row) {
          display: flex;
          flex-wrap: wrap;
        }

        :deep(.arco-col) {
          display: flex;
          flex-direction: column;
        }

        .form-block {
          margin-bottom: 16px;
          flex: 1; // 让卡片高度撑满列
          box-sizing: border-box;

          :deep(.arco-card-body) {
            padding: 16px 20px;
          }

          :deep(.arco-card-header) {
            padding: 16px 20px;
            border-bottom: 1px solid #f2f3f5;
          }

          .block-title {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;

            .arco-icon {
              color: #165dff;
              font-size: 16px;
            }
          }

          .identity-content-layout {
            display: flex;
            gap: 24px;

            .fields-area {
              flex: 1;
            }

            .photo-area {
              width: 140px;

              .id-card-uploader {
                position: relative;
                width: 120px;
                height: 160px;
                border: 1px dashed var(--color-border-3);
                background-color: var(--color-fill-2);
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                &:hover {
                  border-color: var(--color-primary-light-3);
                  background-color: var(--color-primary-light-1);

                  .upload-mask {
                    opacity: 1;
                  }
                }

                .id-photo {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }

                .upload-placeholder {
                  text-align: center;
                  color: var(--color-text-3);
                  .arco-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                  }
                  .text {
                    font-size: 12px;
                  }
                }

                .upload-mask {
                  position: absolute;
                  inset: 0;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: #fff;
                  gap: 4px;
                  opacity: 0;
                  transition: opacity 0.3s;
                  font-size: 12px;
                  .arco-icon {
                    font-size: 18px;
                  }
                }

                :deep(.id-photo-upload-input) {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  opacity: 0;
                  cursor: pointer;
                  .arco-upload-list {
                    display: none;
                  }
                }
              }

              .photo-tip {
                font-size: 11px;
                color: var(--color-text-4);
                margin-top: 8px;
                text-align: center;
              }
            }
          }

          // 针对绩效和职级组件的内部间距优化
          :deep(.performance-tab),
          :deep(.rank-history-tab) {
            padding: 0;
          }
        }
      }
    }
  }

  .empty-detail {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;

    .empty-content {
      text-align: center;
      color: #86909c;

      .arco-icon {
        color: #e5e6eb;
        margin-bottom: 16px;
      }

      h3 {
        color: #1d2129;
        margin-bottom: 8px;
      }
    }
  }

  :deep(.arco-form-item-label) {
    font-weight: 500;
    color: #4e5969;
    margin-bottom: 6px;
  }

  :deep(.arco-input-wrapper),
  :deep(.arco-select-view),
  :deep(.arco-textarea-wrapper) {
    background-color: #f7f8fa;
    border-color: #f2f3f5;
    &:hover {
      background-color: #f2f3f5;
    }
  }
</style>
