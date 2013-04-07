$( function() {

var csv_text = 'date,sugar\n\
2011-01-13T15:42:08,108\n\
2011-01-14T15:42:08,108\n\
2011-01-15T15:42:08,108\n\
2011-01-16T15:42:08,108\n\
2011-01-17T15:42:08,108\n\
2011-02-15T20:58:25,121\n\
2011-02-16T20:58:25,121\n\
2011-02-17T20:58:25,121\n\
2011-02-18T20:58:25,121\n\
2011-02-19T20:58:25,121\n\
2011-02-20T20:58:25,121\n\
2011-02-21T20:58:25,121\n\
2011-03-08T16:55:07,100\n\
2011-03-08T18:29:12,91\n\
2011-03-08T19:30:37,94\n\
2011-03-08T21:34:27,126\n\
2011-03-09T08:38:01,242\n';
    var json = [ ];

    json = d3.csv.parse(csv_text);
    json.forEach(fix_row);

    var url = '/data/sugars.csv';
    draw_graph(json);

    d3.csv(url, update_data);

} );

// make these things debuggable from console
var my = { };

function draw_graph(data) {
  var results,
      chart,
      dots,
      margin = 100,
      w = 8,
      h = 500,
      x, y,
      width = $('#lab').width( ),
      xAxis, yAxis
      zoom = 40
      ;
  var scaleExtent = [ 0, 200 ];

  // allow some granularity between our notion of scale and d3's
  my.zScale = d3.scale.linear( ).domain(scaleExtent).rangeRound( [0, 1000] );
  // but force only 8 layout switches
  my.zSwitching = d3.scale.linear( ).domain([0,1000]).rangeRound([0,8]);

  console.log( $('#lab'), $('#lab').width( ) );
  $('#lab #test').remove( );
  $('#lab').append( $('#clone').clone(true).attr('id', 'test') );

  chart = d3.select( '#test' ).append( 'svg' )
      .attr( 'class', 'chart' )
      .attr( 'width', width )
      .attr( 'height', h )
      .append('g');

  d3.select('svg g')
      .attr('transform', 'translate(50, 50)');

  var first = d3.time.day.round(d3.time.day.offset(new Date( ), -1)),
      last  = d3.time.day.round(d3.time.day.offset(new Date( ), 1))
      ;
  my.first = first;
  my.last = last;
  my.range = d3.time.day.range(d3.time.day.offset(last, -5), last);
  // my.range = d3.time.day.range(first, last);
  console.log(my);
  x = d3.time.scale()
      .domain( [my.range[0], last] )
      .range(  [0, width - margin] )
      ;

  y = d3.scale.linear()
      .domain( [0, d3.max( data, function( d ) { return d.sugar; } )] )
      .rangeRound( [0, h - margin] );

  my.x = x;
  my.y = y;
  // safety bars
  var safeties = {
    low: 70,
    high: 140,
    x: x.range()[0],
    y: (h - margin) - y(140) + .5,
    width: (width),
    height: y(140) -  y(70)  + .5

  };
  var bars = chart.append('g')
          .attr('class', 'safety');

  bars.append('rect')
      .attr('class', 'safe-sugar')
      ;


  // Bars
  dots = chart.append('g')
      .attr('class', 'dots');

  dots.selectAll( 'circle' )
      .data( data )
    .enter().append( 'circle' )
      .attr( 'r', '.5ex')
      // .attr( 'width', w )
      // .attr( 'height', function( d ) { return y( d.population ) } )
      ;

  // Axis
  xAxis = d3.svg.axis()
      .scale(x)
      .ticks(my.range.length)
      .tickSize(12, 1, 1)
      ;
      // .tickFormat(d3.time.format('%m/%d/%y'))
      //.tickSize(25, 18);

  yAxis = d3.svg.axis()
      .scale(d3.scale.linear().domain( [0, d3.max( data, function( d ) { return d.sugar || 0; } )] ).rangeRound( [h - margin, 0] ))
      .ticks(7)
      .tickSize(6, 3, 1)
      .orient('left');

  chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (h - margin) + ')');

  chart.append('g')
      .attr('class', 'y axis');

  my.zoom = d3.behavior.zoom()
    //  By supplying only .x() any pan/zoom can only alter the x scale.  y
    //  scale remains fixed.
      .x(x)
      .scaleExtent( scaleExtent )
      .scale( 4 )
      .on("zoom",render)
  d3.select("svg").call(my.zoom);

  function render() {
    var num_t = my.range.length;
    var halve = d3.round(num_t / 2);
    var factors = [ 88, 66, 44, 50, 66, 88, 66, 22, 22];
    var num_ticks = [ d3.round(halve * .5), halve, d3.round(halve * 1.5),
                      num_t,
                      d3.round(halve * 1.75),
                      halve, halve, halve, halve, halve ];
    // if the zoom level changes, consider resizing the scales.
    var old_zoom = zoom;
    if (d3.event) {
      zoom = my.zScale( d3.event.scale );
      /*
      Idea I'm after is to use zoom scaling to control not only panning, but
      also the unit of time.
      Eg, if first our x scale is based on days, then as we zoom in and hours
      appear in the timeline, the visualization becomes too sparse to drive 
      decisions.  To fix this, it would be nice to reset the x scale so that
      the viewport is filled with the same date range as it was showing, but
      with an x scale defined in hours such that the tick formatting allows a
      dense enough layout to show single events, eg, the 50 hours or so on Fri
      28 in one view.

      I tried forcing the zoom level through a second scale to in an attempt to
      provide an equal amount of wheel rotations per zoom level, which I again
      shove through another scale to reduce down to 8 basic levels.
      The scaling doesn't quite work the way I expected, although it does
      correctly force to 8 zoom levels.

      I also tried detecting changes between two zoom levels that seemed to
      match the days to hours transition followed by changing the x scale, but
      the results were also unpredictable.

      Anyway it should go something like this:
      * vis zoom level 1 - days
      * zoom in, dots separate, 3 hourly time formatting appears
      * zoom in, dots separate, hourly time formatting appears
      * zoom in:
        * switch to vis zoom level 2, (hours)
        * dots condense, better 3 hourly ticks show up with hourly minor ticks
          eg, the scale was reset so that the viewport shows range, but with
          the offsets redefined so that my desired hours defines the viewport

      The effect should be subtle, but allows the UI to transition to useful
      views.
      Eg, when zooming out from hourly back into daily, the x axis would
      redefine the viewport relative to the number of interesting days.
      So as one zooms out, from 1 day, the viewport changes to be defined in
      terms of 2 days.
      The difference is that the current implementation uses the same ratio
      continuously, and I want to redefine the interesting unit of time
      relative to the viewport.
      Ideally, there would be a consistent number of wheel clicks necessary
      between zoom levels.
      */
      var i = my.zSwitching(zoom);
      if ( i != my.zSwitching(old_zoom) ) {
        console.log('changing scales i', i, 'zoom', zoom, 'old_zoom', old_zoom);
        my.pixel_factor = 66;
        // reset some how much space each unit of time takes at different zoom
        // levels..
        my.pixel_factor = factors[i] || 66;
        // changing the output range of the scale will change how much space is
        // taken up per unit of time.
        var px = d3.mouse(this);
        var near = x.invert(px[0]);
        console.log( 'mouse is near', near);
        // x.range(  [0, ( my.pixel_factor * my.range.length ) - margin] )
        ;
        // maybe change number of ticks
         // xAxis = xAxis.ticks(num_ticks[i] || num_t);
        switch (i) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            /*
            my.range = d3.time.day.range(my.first, my.last);
            console.log(my);
            x.domain( [my.first, my.last] )
                .range(  [0, ( my.pixel_factor * my.range.length ) - margin] )
                ;
            xAxis.scale(x);
            */
            break;
          case 4:

            /*
            my.range = d3.time.hour.range(my.first, my.last);
            my.range = d3.time.hour
                         .range(d3.time.hour.offset(near, -1 * (60 / d3.event.scale)),
                                d3.time.hour.offset(near, 90 / d3.event.scale));
            var new_range = [ x(my.range[0]), x(my.range[ my.range.length -1]) ];
            x.domain([ my.range[0], my.range ])
                .range( new_range )
                ;
            xAxis.scale(x).ticks(24);
            */

            break;
          case 5:
            break;
          case 6:
            break;
          case 7:
            break;
          case 8:
            break;
          default:
            break;
        }
      }
      console.log('i', i, 'z', zoom, d3.event.scale, d3.event, my, 'old', old_zoom);
    }
    bars.selectAll("rect")
      .attr( 'x', safeties.x)
      .attr( 'y', safeties.y)
      .attr( 'width', safeties.width)
      .attr( 'height', safeties.height)
      ;
    dots.selectAll("circle")
      .attr( 'cx', function( d, i ) { return x( d.date ) - .5; } )
      .attr( 'cy', function( d ) { return (h - margin) - y( d.sugar ) + .5 } )
      ;
    xAxis.scale(x);
    chart.select(".x.axis").call(xAxis);
    chart.select(".y.axis").call(yAxis);
  }

  //  Call this to place initially
  render();
}



function update_data(rows)  {
  // console.log('XXX', this, arguments);
  if (rows) {
    rows.forEach(fix_row);
    draw_graph(rows);
  }
}

function fix_row(row, i) {
  row.date = d3.time.format.iso.parse(row.date);
  row.sugar = parseInt(row.sugar);
  // console.log('rows each', this, arguments);

}

