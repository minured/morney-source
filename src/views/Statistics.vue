<template>
  <Layout>
    <div class="content-wrapper">
      <Tabs class-prefix="type" :data-source="recordTypeList" :value.sync="type"/>
      <div class="dataList">
        <div v-if="!result" class="tips">暂无数据</div>
        <ol>
          <li v-for="(dateList, i) in result" :key="i">
            <h3 class="title">{{beautifyDate(dateList.date)}} <span>￥{{dateList.total}}</span></h3>
            <ol>
              <li v-for="(record, i) in dateList.records" :key="i" class="record">
                <span>{{tags2String(record.selectedTags)}}</span>
                <span class="notes">{{beautifyNotes(record.notes)}}</span>
                <span>￥{{record.amount}}</span>
              </li>
            </ol>
          </li>
        </ol>
      </div>
      <RecordECharts :chart-option="chartOption"/>
    </div>
  </Layout>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Watch} from 'vue-property-decorator';
  import Tabs from '@/components/Tabs.vue';
  import recordTypeList from '@/constants/recordTypeList';
  import dayjs from 'dayjs';
  import clone from '@/lib/clone';
  import RecordECharts from '@/components/Money/RecordECharts.vue';

  @Component({
    components: {RecordECharts, Tabs}
  })
  export default class Statistics extends Vue {
    recordDate: string[] = [];
    dayTotalAmount: number[] = [];
    dataType = '支出';


    classifyRecord(records: RecordItem[]) {

      if (records.length === 0) {return false;}
      const recordDateList: { date: string; total?: number; records: RecordItem[] }[] = [];

      //自己想的，逻辑有待优化
      records.forEach(record => {
        // const date = record.date!.split('T')[0];
        const date = record.date!
        const dateList = recordDateList.map(item => item.date);
        //不存对应日期的独享，就构建新对象 push进去
        const index = dateList.indexOf(date);
        if (index === -1) {
          recordDateList.push({date: date, records: [record]});
        } else {
          //如果存在对应日期的对象根据index定位对象，然后push进该对象的 records
          recordDateList[index].records.push(record);
        }
      });
      recordDateList.forEach(group => {
        group.total = group.records.reduce((sum, item) => sum + item.amount, 0);
      });
      return recordDateList;
    }

    get recordList() {
      //store的类型是被Vue写死了,是any,所以再取的时候要断言一下
      return (this.$store.state as RootState).recordList;
    }

    get result() {
      const {recordList} = this;

      //收入支出的克隆与排序
      const newRecordList = clone(recordList)
        .filter(r => r.type === this.type)
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

      return this.classifyRecord(newRecordList);

    }

    get chartOption() {
      return {
        tooltip: {
          show: true
        },
        legend: {
          data: []
        },
        xAxis: {
          data: this.recordDate
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: this.dataType,
          data: this.dayTotalAmount,
          type: 'line',
          itemStyle: {
            borderWidth: 3,
            borderType : 'solid',
            color: 'orange'
          },
          lineStyle: {
            color: 'orange'
          }
        }]
      };
    }

    updateChartOption() {

      if (!this.result) {return;}
      const newResult = clone(this.result).reverse();

      newResult.forEach(item => {
        this.recordDate.push(item.date);
        if (!item.total) {return;}
        this.dayTotalAmount.push(item.total);
      });

      if (this.type === '-') {
        this.dataType = '支出';
      } else {
        this.dataType = '收入';
      }
    }

    //遍历记录，把数组push到chart option
    created() {
      //创建的时候，肯定是空的
      this.updateChartOption();
    }

    beforeUpdate() {
      //更新代表切换了tab，清空当前数据
      this.recordDate = [];
      this.dayTotalAmount = [];
      this.updateChartOption();
    }


    type = '-';
    recordTypeList = recordTypeList;

    beforeCreate() {
      this.$store.commit('fetchRecordList');

      //  fetch一下，初始化tagList,后续在App全局fetch
      this.$store.commit('fetchTagList');
    }


    tags2String(tags: Tag[]) {
      //TODO 限制显示长度
      return tags.length === 0 ? '随手记' : tags.map(tag => tag.name).toString();

    }


    beautifyNotes(notes: string) {
      if (notes.length > 20) {
        return (notes.substring(1, 18) + '...');
      } else {
        return notes;
      }
    }

    beautifyDate(date: string) {
      const day = dayjs(date);
      const now = dayjs();
      if (day.isSame(now, 'day')) {
        return '今天';
      } else if (day.isSame(now.subtract(1, 'day'), 'day')) {
        return '昨天';
      } else if (day.isSame(now.subtract(2, 'day'), 'day')) {
        return '前天';
      } else if (day.isSame(now, 'year')) {
        return day.format('M月D日');
      } else {
        return day.format('YYYY年MM月DD日');
      }


    }
  }
</script>

<style lang="scss" scoped>
  ::v-deep {
    .type-tab-item {
      background: white;
      height: 50px;

      &.selected {
        background: #c4c4c4;

        &::after {
          display: none;
        }
      }
    }

    .interval-tab-item {
      height: 48px;
    }
  }

  %item {
    padding: 0 16px;
    min-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    @extend %item;
  }

  .record {
    background: white;
    @extend %item;

    .notes {
      margin-right: auto;
      margin-left: 16px;
      color: #999;
      font-size: 14px;
    }
  }

  .content-wrapper {
    display: flex;
    height: 92vh;
    flex-direction: column;
  }

  .dataList {
    overflow: auto;
    flex-grow: 1;

    > .tips {
      margin-top: 20px;
      text-align: center;
    }
  }


</style>
